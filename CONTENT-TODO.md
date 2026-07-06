# CONTENT-TODO — what the owner needs to supply

The site is fully functional today, but several trust elements are deliberately
**placeholder-structured** because faking them would poison the brand. This file
lists exactly what to supply, where it goes, and what happens when you do.
Ordered by impact.

---

## 1. Phone & WhatsApp number  ⚡ HIGHEST IMPACT — one edit
- **File:** `src/config/site.ts` → the `phone` block.
- Replace `e164: '+923000000000'` with the real number (keep the `+92…` format),
  set `display` to how you want it shown (e.g. `0300 1234567`), and flip
  **`live: false` → `live: true`**.
- What changes automatically, sitewide: every WhatsApp button starts opening a
  real chat with pre-filled context (calculator results, quote summaries), the
  floating pill switches from "Talk to us" (quote form) to "WhatsApp", `tel:`
  links activate, the footer shows the number without the "(being provisioned)"
  note.
- Also add `telephone` to the LocalBusiness schema: uncomment/add in
  `src/layouts/Layout.astro` (search for "telephone").

## 2. Lead email delivery (Resend)
- Get an API key at resend.com → put it in `.env` as `RESEND_API_KEY=…`
  (copy `.env.example` to `.env`).
- Verify the `raysmartsolar.com` domain in Resend, then set
  `LEAD_FROM_EMAIL="RaySmartSolar Leads <leads@raysmartsolar.com>"`.
- Until then the site runs in **dry-run**: every lead is appended to
  `.leads/leads.jsonl` (safe, nothing lost) — check it during testing.
- Leads deliver to `LEAD_TO_EMAIL` (defaults to info@raysmartsolar.com).

## 3. Credentials (PPIB / DISCO / registration)
- **Where:** home page cert bar (`src/pages/index.astro`, search `data-todo="certifications"`)
  and About page (`src/pages/about.astro`, search `data-todo`).
- Supply: PPIB (formerly AEDB) installer certificate **category (C-1/C-2/C-3) and
  certificate number** (verifiable at ppib.gov.pk), LESCO vendor registration
  proof, company registration / NTN numbers.
- Replace the dashed "todo-chip" spans with the real numbers. Never publish a
  number that can't be verified — buyers do check.

## 4. Customer reviews & case studies
- Structure exists on the home page (text block under the fear cards). When you
  have real reviews: add name, area (e.g. "Johar Town"), month, system size, and
  what they say. 3–5 honest ones beat 50 fake-sounding ones.
- Google Business Profile: create one with the EXACT address string used on the
  site (`2nd Floor, 11-A College Block, Allama Iqbal Town, Lahore`) — byte-identical
  NAP is what makes local SEO work.

## 5. Real installation photos
- Current photography is licensed stock, clearly used as atmosphere and never
  claimed as our work (see IMAGE-MANIFEST.md). As soon as you have 5–10 good
  photos of actual installs (wide + detail + meter + happy-roof shots):
  drop them in `src/assets/photos/` and swap on: `/homes` hero, home-page fork
  cards, About atmosphere, city pages.
- Also: team photos + names for the About page team grid (`data-todo="team"`).

## 6. Numbers to review quarterly (they move)
All in `src/data/facts.ts`, each with source comments:
- `PACKAGES` price bands (panel market moves weekly; bands reviewed July 2026)
- `NET_BILLING.exportRateAssumed` / range (NEPRA revises NAEPP)
- `RESIDENTIAL_BILL_ANCHORS` (tariff changes — usually each July + monthly FCA)
- `BATTERY` / `HARDWARE` price snapshots
- Update `PRICES_AS_OF` whenever you touch any of these.

## 7. Domain & deployment
- Confirm production domain (assumed `https://raysmartsolar.com`) — set
  `PUBLIC_SITE_URL` in `.env` and in the host's env. Canonicals, sitemap and
  OG URLs derive from it.
- Deploy: any Node host (see README). Set env vars there too.

## 8. Analytics (optional)
- Set `PUBLIC_ANALYTICS=on` and add your Plausible (or similar) snippet in
  `src/layouts/Layout.astro` head. Events already instrumented: wa_click,
  tel_click, calc_start/result/handoff, quote_open/step/complete/fail,
  guide_open/submit, theme_toggle, city_card, pkg_card, cta_primary.

## 9. Social profiles
- `src/config/site.ts` → `social` block (Facebook/Instagram/YouTube URLs).
  They'll appear in schema `sameAs` once added (Layout wires them when present).

## 10. Buyer's guide PDF (optional nicety)
- The guide ships as a full web article (`/learn/buyers-guide`) gated softly at
  `/guide`. If you want a designed PDF hand-out too: `npx playwright` or headless
  Chrome print of that page works — or ask a designer; the content is final.

## 11. Urdu version (architected, not built)
- Copy structure is centralized (config + data files + per-page copy), so a
  full `/ur/` mirror can be added without redesign. Budget it as its own project;
  Roman-Urdu accents are already in place as warmth.
