# Clarte MD Competitor Research Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a competitor research package (swipe file + per-brand teardowns + synthesis memo) for 10–12 Pakistani skincare brands that actively run paid ads, so Clarte MD's ad landing page system (sub-project #2) can be specced with concrete reference material.

**Architecture:** Sequential dispatch with one parallel fan-out stage. A discovery agent finds the brands → user gates the list → teardown agents run in parallel (one per brand) → synthesis agent merges findings. Outputs are markdown documents and image files written to `clarte-research/` at the project root.

**Tech Stack:** Claude Code subagents (general-purpose + Explore types), WebFetch for static pages, Playwright MCP browser tools for JS-heavy or region-locked pages, Meta Ad Library, Google Ads Transparency Center, TikTok Creative Center.

---

## File Structure

```
D:/May Project/clarte MD Ad Landing pages/
└── clarte-research/
    ├── 00-synthesis.md
    ├── 01-swipe-file/
    │   ├── heroes/
    │   ├── offers/
    │   ├── social-proof/
    │   ├── trust-signals/
    │   ├── ctas/
    │   └── full-pages/
    ├── 02-teardowns/
    │   ├── <brand-slug>.md          (10–12 files)
    │   └── ...
    └── 03-raw/
        ├── discovery.md
        └── ad-library-snapshots/
```

Each file has one clear responsibility:
- `discovery.md` — ranked brand list with one-line justifications + source URLs.
- `<brand-slug>.md` — single-brand teardown following the §5 template from the spec.
- `00-synthesis.md` — cross-brand patterns + whitespace + recommendations for Clarte MD.
- Swipe-file directories — cropped images, named `<brand-slug>-<descriptor>.png`.

---

## Task 1: Initialize Directory Structure

**Files:**
- Create: `clarte-research/` and all subdirectories listed in File Structure above
- Create: `clarte-research/README.md` (one-paragraph orientation for future readers)

- [ ] **Step 1: Create the directory tree**

Run from project root:
```powershell
New-Item -ItemType Directory -Force -Path `
  "clarte-research/01-swipe-file/heroes", `
  "clarte-research/01-swipe-file/offers", `
  "clarte-research/01-swipe-file/social-proof", `
  "clarte-research/01-swipe-file/trust-signals", `
  "clarte-research/01-swipe-file/ctas", `
  "clarte-research/01-swipe-file/full-pages", `
  "clarte-research/02-teardowns", `
  "clarte-research/03-raw/ad-library-snapshots"
```

- [ ] **Step 2: Write `clarte-research/README.md`**

Content:
```markdown
# Clarte MD — Competitor Research

Research package for the Clarte MD launch. Read `00-synthesis.md` first.

- `00-synthesis.md` — strategy memo (cross-brand patterns, whitespace, recommendations)
- `01-swipe-file/` — cropped reference images organized by element type
- `02-teardowns/` — one markdown teardown per studied brand (10–12 brands)
- `03-raw/` — discovery notes and raw ad-library snapshots

Spec: `../docs/superpowers/specs/2026-05-11-clarte-md-competitor-research-design.md`
```

- [ ] **Step 3: Verify the tree exists**

Run:
```powershell
Get-ChildItem -Recurse -Directory clarte-research | Select-Object FullName
```
Expected: 9 directories listed (root + 6 swipe subdirs + teardowns + raw + ad-library-snapshots).

---

## Task 2: Dispatch Discovery Agent

**Files:**
- Create: `clarte-research/03-raw/discovery.md`

- [ ] **Step 1: Dispatch the discovery agent**

Use the Agent tool with `subagent_type: "general-purpose"`. Use this exact prompt (do not edit):

```
You are the discovery agent for the Clarte MD competitor research project. Your single job is to produce a ranked list of 10–12 Pakistani skincare brands that are CURRENTLY running paid ads on Google, Meta, or TikTok, plus brief justification and source URLs for each.

Context: Clarte MD is a new full-range skincare brand launching in Lahore. The research output drives ad landing page design. We need brands whose actual ad funnels we can study — not retailers, not marketplaces, not personal dermatologist clinic sites.

Discovery sources (use all three):

1. Meta Ad Library — https://www.facebook.com/ads/library/ — filter Country=Pakistan, Ad Category=All ads, search terms: "skincare", "whitening cream", "vitamin c serum", "acne treatment", "anti aging", "dermatologist". Look for brands with at least 3 active ads.

2. Google Ads Transparency Center — https://adstransparency.google.com/ — filter Advertiser Location=Pakistan, search same terms. Look for advertisers with active campaigns.

3. TikTok Creative Center — https://ads.tiktok.com/business/creativecenter/ — filter Region=Pakistan, Industry=Beauty & Personal Care. Look for brand advertisers (not just creators).

Plus: run SERP checks on google.com for queries "best whitening cream Pakistan", "acne treatment Pakistan", "vitamin C serum Pakistan", "anti-aging cream Pakistan", "dermatologist skincare Pakistan". Capture sponsored result advertisers.

Use WebFetch first. If a page is JS-heavy or region-locked and WebFetch returns no useful data, use the Playwright browser MCP tools (mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot) to render and inspect.

Inclusion criteria (must meet ALL):
- Currently running ads on at least one platform (verified in the ad library)
- Sells skincare to consumers in Pakistan
- Has a functional landing page reachable from the ad

Exclusion criteria:
- Marketplaces (Daraz, Shophive, Goto)
- Brands only running retargeting ads (no cold-traffic landing page)
- Personal dermatologist clinic sites (different funnel)
- International brands without a PK-specific landing experience

Output: write your findings to `clarte-research/03-raw/discovery.md` using exactly this format:

---
# Competitor Discovery

## Brands Selected (target 10–12)

### 1. <Brand Name>
- **Platforms running ads:** Meta / Google / TikTok (list which)
- **Hero category:** whitening / acne / anti-aging / multi-category / etc.
- **Landing page URL(s):** <urls, one per platform if different>
- **Ad library proof URL:** <link to the Meta/Google ad library page>
- **Why included:** <one sentence>

### 2. <Brand Name>
...

## Brands Considered But Excluded
- **<Brand>** — reason for exclusion

## Notes
<any patterns you noticed during discovery, surprises, etc.>
---

Target 10–12 brands. If you find fewer than 10 qualifying brands, document why and submit what you have — do not pad with weak examples. If you find more than 12, keep the 12 with the most active ads.

Report back when done with: (1) count of brands selected, (2) full path to discovery.md, (3) any blockers (e.g., ad library region-locked, Playwright failed on X site).
```

- [ ] **Step 2: Verify discovery output**

Read `clarte-research/03-raw/discovery.md` and confirm:
- Between 10 and 12 brands selected
- Each brand has all 5 required fields (platforms, category, URL, proof, why)
- Landing page URLs are real (spot-check 2 of them with WebFetch)
- Brand list is heterogeneous (not all whitening, not all from the same company)

If fewer than 10 brands or missing fields, send follow-up to the agent with specific fixes requested.

- [ ] **Step 3: User gate**

Present the brand list to the user. Ask: "Approve this list to proceed to teardowns, or want to add/swap any?" Wait for approval before Task 3.

---

## Task 3: Dispatch Teardown Agents in Parallel

**Files (per brand, 10–12 brands total):**
- Create: `clarte-research/02-teardowns/<brand-slug>.md`
- Create: `clarte-research/01-swipe-file/full-pages/<brand-slug>-mobile.png`
- Create: `clarte-research/01-swipe-file/full-pages/<brand-slug>-desktop.png`
- Create: `clarte-research/01-swipe-file/<element-type>/<brand-slug>-<descriptor>.png` (multiple)
- Create: `clarte-research/03-raw/ad-library-snapshots/<brand-slug>-<platform>.png`

- [ ] **Step 1: Dispatch one teardown agent per brand, in parallel**

Send ONE message containing one Agent tool call per brand (10–12 parallel calls). Use `subagent_type: "general-purpose"`.

For each brand, use this exact prompt template (substitute `<BRAND_NAME>`, `<BRAND_SLUG>`, `<LANDING_PAGE_URLS>`, `<PLATFORMS>`):

```
You are a teardown agent for the Clarte MD competitor research project. Your job: produce a complete teardown of ONE brand — <BRAND_NAME>.

Inputs you have:
- Landing page URL(s): <LANDING_PAGE_URLS>
- Platforms running ads: <PLATFORMS>
- Brand slug for filenames: <BRAND_SLUG>

Process:

1. For EACH landing page URL, render it in the Playwright browser MCP. Take a full-page screenshot at mobile viewport (375x812) and at desktop viewport (1440x900). Save to:
   - `clarte-research/01-swipe-file/full-pages/<BRAND_SLUG>-mobile.png`
   - `clarte-research/01-swipe-file/full-pages/<BRAND_SLUG>-desktop.png`
   (If multiple URLs for different platforms, suffix with `-meta`, `-google`, `-tiktok`.)

2. Take cropped screenshots of these elements and save them to the corresponding swipe-file directory:
   - Hero block → `01-swipe-file/heroes/<BRAND_SLUG>-hero.png`
   - Primary offer block → `01-swipe-file/offers/<BRAND_SLUG>-offer.png`
   - Social proof section (testimonials/reviews) → `01-swipe-file/social-proof/<BRAND_SLUG>-social.png`
   - Trust signals (certs, doctor endorsements, PMDC) → `01-swipe-file/trust-signals/<BRAND_SLUG>-trust.png`
   - Primary CTA + any sticky CTA → `01-swipe-file/ctas/<BRAND_SLUG>-cta.png`
   Skip any element the brand doesn't have; note its absence in the teardown.

3. Also capture one ad library snapshot per platform the brand runs on, save to `03-raw/ad-library-snapshots/<BRAND_SLUG>-<platform>.png`.

4. Write the teardown to `clarte-research/02-teardowns/<BRAND_SLUG>.md` using EXACTLY this template:

---
# <BRAND_NAME> — Teardown

## 1. Brand Snapshot
- **Positioning:** <one-sentence positioning>
- **Hero category:** <whitening / acne / anti-aging / multi>
- **Price tier:** <budget / mid / premium> — quote a representative product price in PKR
- **Origin claim:** <made in / formulated in / etc.>

## 2. Landing Pages Captured
- Mobile: `01-swipe-file/full-pages/<BRAND_SLUG>-mobile.png` (URL: <url>)
- Desktop: `01-swipe-file/full-pages/<BRAND_SLUG>-desktop.png`
- (repeat per platform if URLs differ)

## 3. Offer Mechanics
- **Discount:** <% off, if any>
- **Payment:** COD / prepay / both
- **Bundle structure:** <description>
- **Free shipping threshold:** <PKR amount or "none">
- **Return policy:** <as stated on the page>
- **First-order incentive:** <if any>

## 4. Hero Anatomy
- **Headline:** "<exact text>"
- **Subhead:** "<exact text>"
- **Hero visual:** <description — product shot, model, lifestyle, before/after>
- **Primary CTA copy:** "<exact text>"
- **CTA color:** <color>
- **Scroll depth to first CTA:** <above-the-fold / 1 scroll / 2+ scrolls>

## 5. Trust Stack
- **PMDC / regulatory:** <mentioned? where?>
- **Dermatologist endorsement:** <named doctor? generic claim?>
- **Manufacturing claim:** <made/formulated in X>
- **Certifications shown:** <list>
- **Review count + source:** <e.g., "2,341 reviews on site" or "imported from Trustpilot">
- **Before/after photos:** <yes/no, count>

## 6. Social Proof Patterns
- **Format:** text / video / UGC / influencer
- **Count on page:** <number>
- **Placement:** <where in scroll>

## 7. Urgency / Scarcity Tactics
- **Countdown timer:** <yes/no>
- **Stock warning:** <yes/no>
- **Limited-time offer:** <yes/no>
- **Exit-intent popup:** <yes/no>

## 8. Funnel Type
<single-product LP / advertorial / quiz funnel / lead-capture / direct-to-cart>

## 9. Mobile UX Notes
- **Observed speed:** <fast / acceptable / slow>
- **Sticky CTA:** <yes/no>
- **WhatsApp click-to-chat:** <yes/no>
- **Instagram cross-link:** <yes/no>
- **Payment methods shown:** <list>

## 10. What to Steal / What to Avoid
**Steal:**
- <specific element + reason>
- <specific element + reason>

**Avoid:**
- <specific element + reason>
- <specific element + reason>
---

Length: 400–800 words plus the screenshot references above. Be concrete and specific — quote exact copy where possible.

Report back with: (1) full path to your teardown file, (2) list of swipe-file images you created, (3) any blockers (page wouldn't load, region-locked, etc.).
```

- [ ] **Step 2: Verify all teardowns landed**

After all parallel agents return, run:
```powershell
Get-ChildItem clarte-research/02-teardowns -Filter *.md | Measure-Object
Get-ChildItem clarte-research/01-swipe-file -Recurse -Filter *.png | Measure-Object
```

Expected:
- Teardown count = brand count from Task 2 (10–12)
- Swipe-file image count ≥ brand count × 5 (5 element categories minimum per brand)

Read 2 random teardowns. Confirm they follow the template exactly (all 10 sections present, no "TBD" placeholders).

- [ ] **Step 3: Fill gaps**

For any teardown that's missing sections or any brand that failed (agent reported blocker), dispatch a single retry agent with the specific gap to fix. Do not move on until every teardown has all 10 sections.

---

## Task 4: Dispatch Synthesis Agent

**Files:**
- Create: `clarte-research/00-synthesis.md`

- [ ] **Step 1: Dispatch the synthesis agent**

Use the Agent tool with `subagent_type: "general-purpose"`. Use this exact prompt:

```
You are the synthesis agent for the Clarte MD competitor research project. Your job: read every teardown in `clarte-research/02-teardowns/` and produce the master strategy memo at `clarte-research/00-synthesis.md`.

Process:

1. Read every file in `clarte-research/02-teardowns/`.

2. Build cross-brand tables in your head for: offer mechanics, hero formulas, trust signals, funnel types, urgency tactics, mobile UX features.

3. Write `clarte-research/00-synthesis.md` using EXACTLY this structure:

---
# Clarte MD — Competitor Research Synthesis

> Master strategy memo. Reads the 10–12 teardowns in `02-teardowns/` and extracts what matters for Clarte MD's ad landing page design.

## Brands Studied
<bulleted list of the brands, one line each, linking to their teardown file>

## 1. Cross-Brand Offer Patterns
The 3–5 offer structures that repeat across winners. For each: what it is, how many brands use it, representative example, why it works in the PK market.

## 2. PK-Specific Trust Signals
Patterns specific to the Pakistani market — the fake-product fear, PMDC, doctor endorsements, COD, WhatsApp ordering, money-back guarantees. Which signals every brand uses vs which are differentiators.

## 3. Hero Formulas
Recurring headline + subhead + CTA shapes. Quote 3–5 real headlines from the teardowns. Identify the structural pattern (e.g., "Problem statement + dermatologist authority + CTA").

## 4. Funnel Type Distribution
Of the studied brands, how many use single-product LPs vs advertorials vs quiz funnels vs direct-to-cart? Which seem to be working best (inferred from ad-spend intensity / page polish)?

## 5. Mobile UX Baseline
The PK skincare mobile UX defaults — sticky CTA, WhatsApp button, COD-first checkout, Instagram cross-link. What's table stakes.

## 6. Whitespace Opportunities
At LEAST 2 patterns nobody in the studied set is using that Clarte MD could own. Be specific — name the gap and the play.

## 7. Recommendations for Clarte MD
Opinionated, concrete guidance:
- **Positioning:** <one sentence>
- **Hero offer structure:** <recommended offer + why>
- **Trust stack to build:** <which signals to prioritize for launch>
- **Funnel type for first ad campaign:** <recommendation + why>
- **Three patterns to avoid:** <specific patterns that fatigued the market>

## 8. Open Questions
Anything the research surfaced that needs a decision from the founder before sub-project #2 (ad landing pages) can be specced.
---

Be opinionated. Vague synthesis is useless — the goal is to drive a concrete spec next. If two patterns conflict, pick one and defend the pick.

Report back with: (1) full path to 00-synthesis.md, (2) the 2+ whitespace opportunities you identified (one-line each), (3) any sections you struggled to fill (e.g., not enough data in teardowns).
```

- [ ] **Step 2: Verify synthesis quality**

Read `clarte-research/00-synthesis.md` end-to-end and confirm:
- All 8 sections present
- §6 (whitespace) contains at least 2 specific opportunities, not vague platitudes
- §7 (recommendations) contains a concrete positioning sentence, a specific offer recommendation, and a named funnel type
- No "TBD" / "TODO" / "to be determined" / "more research needed" in the body

If any section is weak, send a follow-up to the synthesis agent with the specific section to redo.

---

## Task 5: Final Verification & Handoff

- [ ] **Step 1: Run the success-criteria checklist from the spec**

Verify each item from §8 of the spec:

1. `00-synthesis.md` exists with concrete recommendations ✓
2. ≥10 teardown documents exist, each following §5 template ✓
3. Swipe file has ≥5 examples per element category (heroes, offers, social-proof, trust-signals, CTAs) ✓
4. Full-page screenshots (mobile + desktop) exist per brand ✓
5. Synthesis identifies ≥2 whitespace opportunities ✓

Command:
```powershell
Write-Output "Teardowns:";    Get-ChildItem clarte-research/02-teardowns -Filter *.md      | Measure-Object | Select-Object Count
Write-Output "Heroes:";       Get-ChildItem clarte-research/01-swipe-file/heroes           | Measure-Object | Select-Object Count
Write-Output "Offers:";       Get-ChildItem clarte-research/01-swipe-file/offers           | Measure-Object | Select-Object Count
Write-Output "Social:";       Get-ChildItem clarte-research/01-swipe-file/social-proof     | Measure-Object | Select-Object Count
Write-Output "Trust:";        Get-ChildItem clarte-research/01-swipe-file/trust-signals    | Measure-Object | Select-Object Count
Write-Output "CTAs:";         Get-ChildItem clarte-research/01-swipe-file/ctas             | Measure-Object | Select-Object Count
Write-Output "Full-pages:";   Get-ChildItem clarte-research/01-swipe-file/full-pages       | Measure-Object | Select-Object Count
```

Expected: every category ≥5, full-pages ≥ brand_count × 2.

- [ ] **Step 2: Present to user**

Write a one-paragraph summary message to the user containing:
- Brand count studied
- Top 3 patterns from the synthesis
- The whitespace opportunities (one-line each)
- Pointer to read `clarte-research/00-synthesis.md` first

Ask if they want to:
- (a) Proceed to spec sub-project #2 (ad landing page system) using this research, or
- (b) Iterate on the research (deepen one teardown, add a brand, etc.)
