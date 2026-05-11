# Clarté MD — AI Generation Worker

Cloudflare Worker that proxies the **Nano Banana 2** (Gemini 2.5 Flash Image) API for the concern-LP "before / after 12 weeks" previews. Keeps the API key off the client.

## Deploy

1. Get a Gemini API key — https://aistudio.google.com → Get API key
2. Install Wrangler — `npm i -g wrangler`
3. Authenticate — `wrangler login`
4. Init the worker — `wrangler init clarte-ai --no-deploy` (or skip if already set up)
5. Drop `generate-after.js` in as the entry point
6. Add the key as a secret:
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```
7. (Optional, recommended) Create a KV namespace for rate limiting:
   ```bash
   wrangler kv:namespace create RATE_LIMIT_KV
   ```
   Bind it in `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "RATE_LIMIT_KV"
   id = "<the id wrangler printed>"
   ```
8. Deploy:
   ```bash
   wrangler deploy
   ```
9. Wrangler prints a URL like `https://clarte-ai.your-subdomain.workers.dev`. Paste it into each concern-LP:
   ```js
   const USE_MOCK = false;
   const AI_ENDPOINT = 'https://clarte-ai.your-subdomain.workers.dev/';
   ```

## CORS

Edit `ALLOWED_ORIGINS` at the top of `generate-after.js` to include your live domain(s). For local testing, the worker also allows the first origin in the list as a fallback — replace those entries with your real domains before launch.

## Costs (rough)

Gemini 2.5 Flash Image (Nano Banana 2) bills per image generated. At ~$0.039 per image, 1,000 previews/day ≈ $39/day. Rate-limit aggressively (the included KV limit is 5 generations per IP per 5 min) and monitor.

## Safety

- We do **not** persist the user's photo. The Worker forwards the inline image to Gemini and returns the generated output — nothing is written to KV/R2/D1.
- Google's API has a default short retention for safety review; consult the latest [Gemini data policy](https://ai.google.dev/gemini-api/terms) and update your privacy notice accordingly.
- The frontend collects an explicit consent checkbox before sending; this Worker assumes the consent was captured upstream.
