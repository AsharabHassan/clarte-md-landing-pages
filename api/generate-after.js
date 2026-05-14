// Vercel Edge function — /api/generate-after
// Proxies image-to-image generation to Google's Nano Banana 2 (Gemini 2.5 Flash Image).
//
// Deploy:
//   1. cd api-vercel
//   2. npx vercel       (first-time: login in browser, then accept defaults)
//   3. In Vercel dashboard → Project Settings → Environment Variables:
//        Name:  GEMINI_API_KEY
//        Value: <paste your NEW Gemini key — never the one already shared in chat>
//   4. Redeploy: npx vercel --prod
//   5. Paste the production URL into each LP's AI_ENDPOINT constant and set USE_MOCK = false.

export const config = { runtime: 'edge' };

const MODEL = 'gemini-2.5-flash-image';

// Edit this list with your real domains before launch.
const ALLOWED_ORIGINS = [
  'https://clartemd.com.pk',
  'https://www.clartemd.com.pk',
  'http://localhost:8765',
  'http://127.0.0.1:8765',
];

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function jsonRes(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export default async function handler(request) {
  const origin = request.headers.get('Origin') || '';
  const headers = corsHeaders(origin);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== 'POST') {
    return jsonRes({ error: 'Method not allowed' }, 405, headers);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonRes({ error: 'Invalid JSON body.' }, 400, headers);
  }

  const { image_base64, mime_type, concern, prompt } = body || {};
  if (!image_base64 || !prompt) {
    return jsonRes({ error: 'Missing image_base64 or prompt.' }, 400, headers);
  }

  // Size guard — base64 of 8 MB ≈ 11M chars
  if (image_base64.length > 11_000_000) {
    return jsonRes({ error: 'Image too large. Please use one under 8 MB.' }, 413, headers);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonRes({ error: 'Server not configured (GEMINI_API_KEY missing).' }, 500, headers);
  }

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
    return jsonRes({ error: 'Upstream network error.', detail: String(err) }, 502, headers);
  }

  if (!gem.ok) {
    const text = await gem.text().catch(() => '');
    return jsonRes({ error: `Gemini error ${gem.status}`, detail: text.slice(0, 600) }, 502, headers);
  }

  const data = await gem.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find(p => p.inline_data || p.inlineData);
  const inline = imgPart?.inline_data || imgPart?.inlineData;
  if (!inline?.data) {
    return jsonRes({ error: 'No image in response.', detail: JSON.stringify(data).slice(0, 600) }, 502, headers);
  }

  const outMime = inline.mime_type || inline.mimeType || 'image/jpeg';
  return jsonRes({ image: `data:${outMime};base64,${inline.data}`, concern }, 200, headers);
}
