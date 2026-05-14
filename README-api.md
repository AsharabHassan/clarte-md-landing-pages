# Clarté MD — Vercel Deploy (landing pages + AI proxy)

This single Vercel project hosts:
- All 5 landing pages (in `public/`) — index, the 4 concern LPs, and the complete-regimen checkout
- The Edge function (in `api/`) that proxies Google's **Nano Banana 2** (Gemini 2.5 Flash Image) for the AI before/after previews

Same-origin means **no CORS to manage** and the LPs talk to `/api/generate-after` directly.

## Prerequisites

- Node.js 20+ (you have v24 — good)
- A Vercel account at https://vercel.com (free tier is fine)
- A **fresh** Gemini API key from https://aistudio.google.com/app/apikey
  - The two keys you shared in chat are compromised; revoke them and generate a new one before deploying

## Deploy

```powershell
cd "C:\Users\786\Downloads\clarte MD Ad Landing pages\clarte MD Ad Landing pages\api-vercel"
npx vercel login        # one-time; opens browser to authenticate
npx vercel              # first deploy
```

When prompted by `vercel`:
- Set up and deploy? **yes**
- Scope? **your personal account**
- Link to existing project? **no**
- Project name? **clarte-md-ai** (or accept default)
- Directory? **./** (current)
- Override settings? **no**

You'll see a preview URL printed, e.g. `https://clarte-md-ai-abc123.vercel.app`.

## Add the API key

**Recommended — via Vercel dashboard:**
1. https://vercel.com/dashboard → your new project
2. **Settings → Environment Variables**
3. Add: name `GEMINI_API_KEY`, value = your **new** key, scope **Production**
4. Save

**Or via CLI:**
```bash
npx vercel env add GEMINI_API_KEY production
# paste your new key when prompted (only visible to you in the terminal)
```

## Push to production

```bash
npx vercel --prod
```

Vercel prints your final production URL, e.g. `https://clarte-md-ai.vercel.app`.

That URL is where everything lives:
- `https://clarte-md-ai.vercel.app/` → the index page
- `https://clarte-md-ai.vercel.app/acne-protocol.html` → acne LP
- `https://clarte-md-ai.vercel.app/even-tone-protocol.html` → pigmentation LP
- `https://clarte-md-ai.vercel.app/renewal-protocol.html` → anti-ageing LP
- `https://clarte-md-ai.vercel.app/barrier-protocol.html` → hydration LP
- `https://clarte-md-ai.vercel.app/complete-regimen-checkout.html` → full-catalog LP
- `https://clarte-md-ai.vercel.app/api/generate-after` → the AI endpoint (POST only)

The LPs in `public/` are already wired to call `/api/generate-after` and `USE_MOCK = false`. Nothing to edit.

## Custom domain (optional)

If you want these served from a Clarté subdomain (e.g. `protocol.clartemd.com.pk`):
1. Vercel dashboard → your project → **Settings → Domains**
2. Add `protocol.clartemd.com.pk`
3. Vercel shows you the CNAME / A record to add to your DNS — copy it into your DNS provider
4. SSL provisions automatically in ~1 minute

Both URLs work in parallel; ads can point at either.

## Cost

Gemini 2.5 Flash Image bills per generated image (~$0.039 each at current pricing).
- 1,000 selfies/day ≈ $39/day
- 100/day ≈ $4/day
- Vercel hosting itself is free at this scale

If you anticipate volume, add a rate limit (we can drop in a Vercel KV-based limiter when traffic justifies it).

## Safety

- The Edge function does **not** persist any user photo. The request body forwards once to Gemini and the response is returned.
- Google's API has its own data-retention policy — review at https://ai.google.dev/gemini-api/terms before launch.
- Each LP collects an explicit consent checkbox before sending.

## Troubleshooting

- **`500 Server not configured`** → `GEMINI_API_KEY` env var not set (or not redeployed after setting).
- **`502 Gemini error 403`** → API key invalid or quota exceeded — generate a new key in Google AI Studio.
- **`502 No image in response`** → Gemini may have refused the specific selfie (safety filter). Try a different photo.
- **AI returns nothing visible** → check browser DevTools network tab; the response should be a base64 data URL.

## Local development

The LPs in `public/` have `USE_MOCK = false`. To test locally with mock images instead:
- Use the originals in `../landing-pages/` (those still have `USE_MOCK = true`)
- Or temporarily flip `USE_MOCK` to `true` in any individual `public/*.html` while testing
