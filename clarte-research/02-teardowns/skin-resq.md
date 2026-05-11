# Skin Resq — Teardown

> Sources accessed: `myskinresq.com` (homepage, /collections/all, /collections/best-sellers, PDPs for SkinResq Brightening Cream and Japanese Secret Rice Mask, /pages/contact). The brief's URL `skinresq.com.pk` did not resolve (ECONNREFUSED / typo / parked). Facebook page confirms the Lahore base. `/pages/about-us`, `/pages/about`, `/policies/shipping-policy`, and `/policies/refund-policy` all returned 404 — meaning none of these standard trust pages are wired up. That is itself a finding.

## 1. Brand Snapshot
- **Positioning:** Direct-to-consumer Shopify skincare brand from Lahore. Markets on "glow / brightening / fairer complexion" — *not* dermatology, *not* "Rx", *not* clinical authority. Rotating hero copy literally cycles: "GLOWING SKIN," "FAIRER COMPLEXION," "SMOOTH TEXTURE," "CLEAR SKIN," "BRIGHTER SKIN."
- **Hero category:** Brightening / glow / Korean-adjacent (rice-mask hero).
- **Price tier — 3 PKR points:** Mini Rice Mask **Rs. 800**, SkinResq Brightening Cream **Rs. 1,899** (from Rs. 2,400), Summer Glow Bundle **Rs. 2,798** (from Rs. 4,698).
- **Origin:** Lahore, Pakistan (per Facebook page "Skin Resq | Lahore").
- **Where sold:** Own site `myskinresq.com` only. No marketplace/retailer footprint surfaced.

## 2. Landing Pages
The site is a tiny 4-SKU Shopify store. The only landing destinations are:
- Homepage (acts as the campaign LP for "SUMMER SALE IS LIVE - 20% OFF + FREE RICE MASK + FREE Shipping").
- `/collections/all` and `/collections/best-sellers` (both surface the same 4 SKUs).
- 4 PDPs.
- No long-form LPs, no quiz, no concern-based landers (no /acne, /pigmentation, /retinol), no blog. The funnel is single-page → PDP → cart.

## 3. Single-Product Pricing
Only 4 SKUs exist on the site:

| Skin Resq SKU | Sale Px | List Px | Clarte MD comparable | Verdict |
|---|---|---|---|---|
| Mini Japanese Rice Mask | Rs. 800 | — | (no analog — bundle-only) | trial-tier |
| Japanese Secret Rice Mask | Rs. 1,299 | Rs. 2,200 | — | mid-mass |
| SkinResq Brightening Cream | Rs. 1,899 | Rs. 2,400 | Lightening Cream Rs. 2,800 | **Skin Resq ~32% cheaper** |
| Summer Glow Bundle | Rs. 2,798 | Rs. 4,698 | Radiance Ritual Bundle Rs. 5,000 | **Skin Resq ~44% cheaper bundle AOV** |

Direct comparison to Clarte MD's announced range (Rescue Wash Rs. 2,000 / Acne Serum Rs. 2,200 / Retinol Rs. 2,300 / Vit CE Rs. 2,350 / Lightening Cream Rs. 2,800): **Skin Resq sits a clean tier below Clarte MD on every overlap.** Skin Resq's full retail (Rs. 2,400 brightening cream) is below Clarte's *retail* on the equivalent SKU (Rs. 2,800), and on sale Skin Resq drops to Rs. 1,899 — roughly 67% of Clarte's price. **Skin Resq is local-mass, not premium-local.**

## 4. Bundle Economics (CRITICAL)
**Hero bundle: "Summer Glow Bundle"**
- Sale Rs. 2,798 / List Rs. 4,698 → **40% off / Rs. 1,900 saved**.
- Components not itemized on the PDP (PDP returns 404 on `summer-glow-bundle` and `summer-glow-bundle-1`) — math has to be inferred from homepage list: most likely Brightening Cream (Rs. 2,400) + Rice Mask (Rs. 2,200) = Rs. 4,600 list, close to but not exactly Rs. 4,698.
- **Free gift:** "FREE RICE MASK" stacked on top of the 20% sitewide offer.
- **Shipping:** "FREE Shipping" included in summer-sale banner. No threshold disclosed.
- **Hero offer (verbatim):** "SUMMER SALE IS LIVE - 20% OFF + FREE RICE MASK + FREE Shipping."
- All 4 SKUs were marked **Sold out** at the time of audit — meaning the offer is being advertised but nothing is buyable. Either supply constraint or staged scarcity.

vs. Clarte MD Radiance Ritual Bundle Rs. 5,000: **Skin Resq's bundle is Rs. 2,200 cheaper (~44% lower AOV), advertises a deeper headline discount (40% vs. whatever Clarte plans), and stacks free product + free shipping.** That is a hard anchor for any cold buyer comparing.

## 5. Hero Anatomy
- Above-the-fold = single banner with rotating benefit words (no still hero image of a doctor, lab, or product line-up).
- Promo bar (verbatim): "SUMMER SALE IS LIVE - 20% OFF + FREE RICE MASK + FREE Shipping."
- No founder face, no "Dr." headshot, no lab b-roll, no PMDC, no clinic.
- Sections in order: rotating benefits → "WHY CHOOSE US?" → "Trusted by millions" → "SKINRESQ TREATMENT" → results stat block → testimonials → "Get in touch!"
- Result stats (verbatim, repeated across home + PDPs):
  - "97% Experienced Brighter Skin in Just 4 Weeks"
  - "98% Achieved More Even Skin Tone in Only 8 Weeks"
  - "95% Saw Noticeable Reduction in Dark Spots Within 6 Weeks"
- No sample size, no clinical study reference, no methodology — these are decorative stats.

## 6. Trust Stack — EXPANDED
- **Doctor-led framing audit:** **Not present.** Across homepage, both PDPs audited, contact page, and collection pages, there is **no mention of Dr. Shereen, no dermatologist photo, no signature, no credential string (MBBS / FCPS / Diplomate), no "Rx" mark, no clinic, no PMDC license, no manufacturing partner**. The brand sells under a *name that sounds clinical* ("Resq" + "Rx-adjacent typography") but does **zero** doctor-led storytelling. This directly contradicts the brief's premise that Skin Resq markets "explicit clinical claims" — based on the live site, they do not.
- **About page:** 404. Brand has no traceable origin story on-site.
- **Manufacturing / Certifications:** Not present. No "Made in Pakistan / Made in Korea / GMP / dermatologically tested" badge surfaced.
- **PMDC:** Not present.
- **Reviews:** No verified review widget (Judge.me / Yotpo / Loox) — only 3 hand-written homepage testimonials ("Ayesha Khan, Ali Hassan, Sara Ahmed") and a 9-card carousel on PDPs. No star count, no review count.
- **Before/after:** Present on PDPs as "Day 1 vs Day 12" comparison images. Source / model identity / consent not stated.
- **Benefit chips:** "Plant-Based Formula / Moisturizing / Brightens Dark Spots / Cruelty-Free."

## 7. Social Proof
3 named testimonials on home + 9-testimonial carousel on PDPs, all 5-star, all anonymous-feeling Pakistani names. No UGC photo wall, no Instagram embed grid, no influencer call-outs, no press logos. "Trusted by millions" claim with no number behind it.

## 8. Urgency / Scarcity
- "SUMMER SALE IS LIVE" banner.
- "SAVE 40%" badges on rice mask + bundle.
- **All 4 SKUs "Sold out"** at audit — passive scarcity, but it also kills the funnel.
- No countdown timer, no stock-counter ("only 3 left"), no expiry date on the offer.

## 9. Funnel Type
Pure Shopify storefront, mass-market funnel. Home → PDP → ATC → cart → checkout. No lead magnet, no email gate, no quiz, no WhatsApp pop-in, no Messenger plug. Promo bar = the entire conversion driver.

## 10. Mobile UX
Shopify Dawn-family theme. Fast, responsive, sticky promo bar. No mobile-specific WhatsApp FAB, no sticky ATC. Currency is Rs. native. Contact "form-only" (no tappable phone/WhatsApp) is a meaningful mobile-conversion gap in the Pakistani market.

## 11. Clarte MD Strategic Implications — MOST IMPORTANT SECTION

### What to steal (2–3)
1. **The "free gift unlocks free shipping" stacked offer construction.** "SUMMER SALE IS LIVE - 20% OFF + FREE RICE MASK + FREE Shipping" reads as three wins in one line. Clarte MD's Rs. 5,000 Radiance Ritual Bundle can replicate this as "Bundle + FREE 4th product + FREE COD shipping" — three perceived wins on a single banner line.
2. **Day-1-vs-Day-12 before/after framing.** Cheap to produce, high-trust signal vs. abstract claim copy. Clarte should produce real Day-1/Day-14/Day-28 tracks per hero SKU with the doctor's signature as proof-of-supervision (something Skin Resq cannot do).
3. **Rotating benefit hero band.** Simple, mobile-fast way to claim multiple use-cases without committing to one positioning. Clarte can do "DERMATOLOGIST-DEVELOPED / IMPORTED-GRADE FORMULAS / DELIVERED PAN-PAKISTAN" as the rotation.

### What to avoid (1–2)
1. **Skin Resq's "Trusted by millions" + made-up stats with no source.** Pakistani consumers are increasingly cynical; Clarte's "MD" suffix means every claim needs a citation or a doctor's name behind it. Generic "98% of users" without an N and a clinic name is a *liability* for an MD-positioned brand.
2. **A 4-SKU catalogue with everything constantly "sold out."** Skin Resq is running ads (per the live promo) but cannot fulfill — the worst possible spend/inventory mismatch. Clarte must launch with verified stock-depth on all 5 hero SKUs + the bundle.

### Direct threat assessment

1. **Pricing tier Skin Resq actually occupies.** Local-mass / mid-market. Hero cream Rs. 1,899; bundle Rs. 2,798. They sit *below* Clarte MD on every overlapping SKU, and well below imported premium (The Ordinary / CeraVe / Skinceuticals at Rs. 3,500–10,000 in-market). Skin Resq is **not** competing for Clarte's whitespace on price — they're a tier down.
2. **Do they market clinical authority the same way Clarte plans to?** **No.** Despite a brand name that *sounds* clinical (Resq ≈ Rx), the live site has zero doctor-led storytelling, no PMDC, no credentials, no clinic, no founder face. They lean K-beauty / brightening / glow — not dermatology. Clarte MD has a clean lane.
3. **Hero offer / AOV play.** Summer Glow Bundle Rs. 2,798 / Rs. 4,698 list (40% off) + free rice mask + free shipping. **Bundle AOV Rs. 2,798**, which is 56% of Clarte's Rs. 5,000 bundle. They are playing a low-AOV high-discount game; Clarte's job is to *justify* the higher AOV with trust assets, not to match the discount.
4. **Three specific moves Clarte MD must make to differentiate from Skin Resq.**
   - **(a) Lead with a named, photographed, credentialed doctor on the hero LP** (face + "MBBS, [specialty], PMDC #XXXXX" + signature). Skin Resq has a clinical-*sounding* name but no clinical *person* — Clarte should occupy that gap permanently with a single founder portrait above the fold and a 30-second founder-intro video on the bundle PDP.
   - **(b) Re-anchor the bundle at Rs. 5,000 with "imported-grade actives at Pakistani price" math** that explicitly disclaims local-mass: list each component's % active and an imported-brand equivalent ("Niacinamide 10% — same % as The Ordinary @ Rs. 3,200; ours Rs. 1,200 in-bundle"). Skin Resq cannot do this because their PDPs don't disclose % actives. This converts the Rs. 2,200 price gap from a *weakness* into a *receipt*.
   - **(c) Add COD + WhatsApp-order on every PDP and a 30-day "doctor-backed return."** Skin Resq has no visible phone number, no WhatsApp, a 404 refund policy, and a contact-form-only flow. In Pakistani DTC, COD + WhatsApp + visible returns are conversion-table-stakes; Skin Resq is failing all three. This is a free trust win for Clarte.
5. **Where Skin Resq is exploitably weak:**
   - **404 on /pages/about, /policies/shipping-policy, /policies/refund-policy.** Standard trust pages literally do not exist.
   - **No PMDC, no doctor, no manufacturer, no clinic** — despite a clinical-sounding name.
   - **All 4 SKUs sold out** — they advertise an offer they can't fulfill.
   - **No COD, no WhatsApp, no phone number** on the contact page.
   - **No real review widget** — only handwritten testimonials.
   - **Tiny 4-SKU catalogue** — no concern-based LPs, no routine-builder, no regimen story.

   Any one of these is exploitable in Clarte's ad copy ("real PMDC-registered doctor, real before-after, real returns, real stock"). Stacking three of them as comparison bullet points (without naming Skin Resq) is a near-perfect cold-traffic page.

## 12. Open Questions / Data Gaps
- `skinresq.com.pk` (brief's URL) is dead — confirm whether this was ever live or whether the brief's "Dr. Shereen" reference was a category-confusion with Dr. Shereene Idriss (NYC) or Dr. Shireen Ansari (Islamabad).
- Summer Glow Bundle PDP returns 404 — exact component list not verifiable.
- About / shipping / refund policies all 404 — cannot quote actual delivery windows or return terms.
- Facebook page truncated; could not confirm follower count or page-level "About" copy.
- No visible WhatsApp / phone number anywhere — confirm via Instagram bio if possible.
- Whether the "Sold out" status is supply-side or a sale-merchandising tactic.
