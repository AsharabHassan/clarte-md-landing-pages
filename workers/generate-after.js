// Cloudflare Worker — /api/generate-after
// Proxies image-to-image generation to Google's Nano Banana 2 (Gemini 2.5 Flash Image).
// Deploy:
//   1. Create a Worker at dash.cloudflare.com → Workers & Pages
//   2. Paste this file
//   3. Add secret: wrangler secret put GEMINI_API_KEY  (from aistudio.google.com)
//   4. Update AI_ENDPOINT in the landing pages to your Worker URL and set USE_MOCK = false
//
// Request: POST /  body = { image_base64, mime_type, concern, prompt }
// Response: { image: "data:image/jpeg;base64,..." }

const ALLOWED_ORIGINS = [
  'https://clartemd.com.pk',
  'https://www.clartemd.com.pk',
  // add your hosting domain(s) here
];

const MODEL = 'gemini-2.5-flash-image';

const CORS_HEADERS = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
});

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS(origin) });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS(origin) });
    }

    // Basic rate limit: 5 generations per IP per 5 minutes (uses KV if bound, else permissive)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (env.RATE_LIMIT_KV) {
      const key = `rl:${ip}`;
      const count = parseInt((await env.RATE_LIMIT_KV.get(key)) || '0', 10);
      if (count >= 5) {
        return jsonRes({ error: 'Rate limit reached. Try again in 5 minutes or WhatsApp our team.' }, 429, origin);
      }
      await env.RATE_LIMIT_KV.put(key, String(count + 1), { expirationTtl: 300 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonRes({ error: 'Invalid JSON body.' }, 400, origin);
    }

    const { image_base64, mime_type, concern, prompt } = body || {};
    if (!image_base64 || !prompt) {
      return jsonRes({ error: 'Missing image_base64 or prompt.' }, 400, origin);
    }

    // Size guard ~ 8 MB base64 ≈ 6 MB binary
    if (image_base64.length > 11_000_000) {
      return jsonRes({ error: 'Image too large. Please use one under 8 MB.' }, 413, origin);
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return jsonRes({ error: 'Server not configured (GEMINI_API_KEY missing).' }, 500, origin);
    }

    // Call Gemini 2.5 Flash Image (Nano Banana 2)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mime_type || 'image/jpeg', data: image_base64 } },
        ],
      }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        temperature: 0.4,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      ],
    };

    let gem;
    try {
      gem = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      return jsonRes({ error: 'Upstream network error.', detail: String(err) }, 502, origin);
    }

    if (!gem.ok) {
      const text = await gem.text().catch(() => '');
      return jsonRes({ error: `Gemini error ${gem.status}`, detail: text.slice(0, 600) }, 502, origin);
    }

    const data = await gem.json();
    // Extract inline image data
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find(p => p.inline_data || p.inlineData);
    const inline = imgPart?.inline_data || imgPart?.inlineData;
    if (!inline?.data) {
      return jsonRes({ error: 'No image in response.', detail: JSON.stringify(data).slice(0, 600) }, 502, origin);
    }
    const outMime = inline.mime_type || inline.mimeType || 'image/jpeg';
    const dataUrl = `data:${outMime};base64,${inline.data}`;
    return jsonRes({ image: dataUrl, concern }, 200, origin);
  },
};

function jsonRes(obj, status, origin) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS(origin) },
  });
}
