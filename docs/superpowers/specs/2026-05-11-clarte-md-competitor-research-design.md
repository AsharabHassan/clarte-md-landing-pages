# Clarte MD — Competitor Research Design

**Date:** 2026-05-11
**Owner:** Faisal (Clarte MD)
**Status:** Approved (brainstorming phase)
**Scope:** Sub-project #1 of 4 in the Clarte MD launch (research only — does not include site build, ad page build, or before/after tool).

---

## 1. Purpose

Clarte MD is a new full-range skincare brand launching in Lahore, Pakistan. Before designing the dedicated brand site, ad landing pages, or the before/after visualization tool, we need a grounded picture of how existing Pakistani skincare brands acquire customers through paid advertising.

The output of this research is a strategy memo plus a swipe file that will directly drive the spec for sub-project #2 (the ad landing page system).

Specifically, the research must answer:

1. Who is actively spending on paid ads in the Pakistani skincare market right now?
2. What offers, hooks, and trust signals convert in this market?
3. What patterns repeat across winners (and what does nobody do that Clarte MD could own)?
4. What does the local landing-page UX look like — COD-first, WhatsApp handoff, mobile-first realities?

Out of scope: organic SEO research, influencer marketing analysis, retail/distribution research, product formulation comparisons.

## 2. Competitive Frame

- **Geography:** Lahore-focused but Pakistan-wide (skincare brands in PK don't typically segment by city for paid ads).
- **Category:** Full-range skincare (Clarte MD is multi-category, not whitening- or acne-only).
- **Tier:** Local Pakistani brands — not international "medical-grade" brands like SkinCeuticals or Paula's Choice. The competitive frame is who a PK customer realistically clicks on.

## 3. Ad Platforms Covered

All three platforms where PK skincare brands meaningfully spend:

- **Google Ads** — search and display, captured via Google Ads Transparency Center and SERP checks.
- **Meta (Facebook + Instagram)** — captured via the Meta Ad Library, Pakistan filter, skincare keywords.
- **TikTok** — captured via TikTok Creative Center / TikTok Ad Library, PK filter.

For each brand, we capture the landing pages those ads point to (which is often different per platform — Meta ads frequently land on a more aggressive, COD-first page than Google ads).

## 4. Competitor Selection

**Discovery model:** agent-driven. Agents search the three ad libraries above plus run sponsored-result SERP checks for high-intent PK skincare queries (e.g., "best whitening cream Pakistan", "acne treatment Lahore", "vitamin C serum Pakistan", "anti-aging cream Pakistan", "dermatologist skincare Pakistan").

**Target set size:** 10–12 brands actively running paid ads.

**Inclusion criteria** (must meet all):

- Brand is currently running ads on at least one of the three platforms (verified in the ad library).
- Brand sells skincare to consumers in Pakistan.
- Brand has a functional landing page reachable from the ad.

**Exclusion criteria:**

- Pure e-commerce marketplaces (Daraz, Shophive) — they aren't brands.
- Brands that only run retargeting ads (no cold-traffic landing page to study).
- Personal dermatologist clinic websites (different funnel — book appointment, not buy product).

If fewer than 10 brands meet the criteria, we accept the smaller set rather than padding with weaker examples. If more than 12 qualify, we keep the 12 with the highest ad activity (more ads currently live = stronger signal).

## 5. Per-Brand Capture Set

Each studied brand produces one teardown document and its slice of the swipe file. The teardown follows a fixed template so the synthesis step can compare across brands:

1. **Brand snapshot** — positioning sentence, hero product category, price tier, country of origin / manufacturing claim.
2. **Landing pages captured** — full-page screenshots, both mobile and desktop, one per ad platform if the destination URLs differ. Stored in `01-swipe-file/full-pages/`.
3. **Offer mechanics** — discount %, COD vs prepay, bundle structure, free shipping threshold, return policy, any first-order incentive.
4. **Hero anatomy** — headline text, subhead text, hero visual description, primary CTA copy and color, scroll depth to the first CTA.
5. **Trust stack** — PMDC / regulatory mentions, dermatologist endorsements, "made in / formulated in" claims, certifications, review count and source, before/after photos.
6. **Social proof patterns** — testimonial format (text, video, UGC, influencer), placement on page, count.
7. **Urgency / scarcity tactics** — countdown timers, stock warnings, limited-time offers, exit-intent popups.
8. **Funnel type** — single-product landing page, advertorial, quiz funnel, lead-capture form, or direct-to-cart storefront.
9. **Mobile UX notes** — page weight / observed speed, sticky CTA presence, WhatsApp click-to-chat button, Instagram cross-link, payment methods shown.
10. **"What to steal" / "What to avoid"** — analyst notes specific to that brand.

## 6. Deliverables

All output lives in `clarte-research/` at the project root:

```
clarte-research/
├── 00-synthesis.md              ← master strategy memo
├── 01-swipe-file/
│   ├── heroes/                  ← cropped hero sections
│   ├── offers/                  ← offer blocks, pricing, bundles
│   ├── social-proof/            ← testimonials, before/afters, UGC blocks
│   ├── trust-signals/           ← certs, doctor endorsements, PMDC
│   ├── ctas/                    ← CTA buttons, sticky bars, exit intents
│   └── full-pages/              ← full-page screenshots, mobile + desktop
├── 02-teardowns/
│   ├── <brand-slug>.md          ← one per brand, 10–12 total
│   └── ...
└── 03-raw/
    └── ad-library-snapshots/    ← raw screenshots from Meta/Google/TikTok ad libraries
```

### 6.1 Teardown docs (`02-teardowns/<brand>.md`)

Each follows the section order in §5. Length: roughly 400–800 words plus embedded screenshot references.

### 6.2 Swipe file (`01-swipe-file/`)

Organized by element type, not by brand. Each subdirectory contains cropped images named `<brand-slug>-<short-descriptor>.png` so the designer can scan by pattern.

### 6.3 Synthesis memo (`00-synthesis.md`)

The punchline document. Sections:

- **Cross-brand patterns** — the 3–5 offer structures that repeat across winners.
- **PK-specific trust signals** — what every brand does to counter the fake-product fear (PMDC, doctor endorsements, money-back guarantees, WhatsApp ordering).
- **Hero formulas** — recurring headline/subhead/CTA shapes.
- **Whitespace opportunities** — what nobody is doing that Clarte MD could own.
- **Recommendations for Clarte MD** — concrete, opinionated guidance on positioning, offer structure, trust stack, and funnel type given the landscape.

## 7. Execution Model

- **Discovery agent (1)** — runs first. Searches the three ad libraries plus SERP checks. Produces a ranked list of 10–12 qualifying brands with one-line justification each. Saves discovery notes to `03-raw/discovery.md`.
- **Teardown agents (parallel, one per brand or per small cluster of 2 brands)** — dispatched after discovery. Each agent:
  - Loads the brand's ad landing pages (via WebFetch for static pages, Playwright browser MCP for JS-heavy pages).
  - Takes mobile + desktop screenshots.
  - Crops swipe-file elements.
  - Writes the teardown markdown.
- **Synthesis agent (1)** — runs last. Reads all teardowns, produces `00-synthesis.md`.

Agents work in parallel where there are no dependencies. Discovery blocks teardowns; teardowns block synthesis.

**Tooling fallback:** if a landing page is JS-heavy, region-locked, or blocks WebFetch, the agent uses the Playwright browser MCP to render the page in a real browser before capturing screenshots.

**Expected wall-clock:** 30–60 minutes depending on how many landing pages need Playwright rendering versus static fetch.

## 8. Success Criteria

The research is complete when:

1. `00-synthesis.md` exists and contains concrete, opinionated recommendations for Clarte MD's positioning, offer, trust stack, and funnel type.
2. At least 10 teardown documents exist, each following the §5 template.
3. The swipe file contains at least 5 examples per element category (heroes, offers, social-proof, trust-signals, CTAs).
4. Full-page screenshots (mobile + desktop) exist for every studied brand.
5. The synthesis identifies at least 2 whitespace opportunities — patterns nobody in the studied set is using.

## 9. Out of Scope (explicit)

- Building the Clarte MD ad landing pages — that is sub-project #2, specced separately.
- Building the main brand site — sub-project #4.
- Building the before/after visualization tool — sub-project #3.
- International brand research (deferred unless the synthesis surfaces a clear gap).
- Organic SEO, influencer marketing, retail/distribution research.

## 10. Open Questions

None blocking. The following will be decided when sub-project #2 (ad landing pages) is specced:

- Which specific Clarte MD product(s) get the first ad landing pages.
- Whether Clarte MD's first funnel is single-product, advertorial, or quiz.
- Brand voice and visual system (independent design track).
