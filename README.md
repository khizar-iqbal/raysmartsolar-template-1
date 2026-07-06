# RaySmartSolar — website

Conversion-first marketing site for RaySmartSolar (solar installation, Lahore →
all major Pakistani cities). Built honest: 2026 net-billing math, prices as
dated ranges, no fabricated trust signals.

## Stack

- **Astro 5** (static-first; the lead API route is the only server surface) + **@astrojs/node** (standalone)
- **Tailwind CSS 4** via `@tailwindcss/vite` — all design tokens in `src/styles/global.css` (`@theme` + CSS custom properties; dusk default theme + composed day theme)
- **GSAP + ScrollTrigger + SplitText** and **Lenis** — loaded only on capable devices (`src/scripts/motion.ts`), CSS-only reveal fallback everywhere else
- **sharp** via `astro:assets` — responsive AVIF/WebP from originals in `src/assets/photos/`
- Fonts self-hosted: Fraunces (display), Satoshi (UI), Spline Sans Mono (numbers)

## Run it

```bash
npm install
cp .env.example .env        # optional — site runs in dry-run mode without it
npm run dev                 # http://localhost:4321
npm run build && npm run preview   # production build + server
```

**Deploy:** any Node host (the build outputs `dist/server/entry.mjs`; run with
`node dist/server/entry.mjs`, port via `PORT`). Reverse-proxy behind nginx/caddy
or run on a platform (Railway/Render/Fly/VPS). Set env vars from `.env.example`.

## Where things live

| Thing | File |
|---|---|
| Name / address / email / **phone (placeholder!)** | `src/config/site.ts` — single source, see CONTENT-TODO.md §1 |
| Market numbers (prices, tariffs, rates, warranties) | `src/data/facts.ts` (cites FACTS.md research) |
| City data (DISCOs, yields, local notes) | `src/data/cities.ts` |
| Savings engine (pure functions + tests via tsx) | `src/lib/calc.ts` |
| Lead intake (validation, honeypot, rate limit, Resend, dry-run) | `src/lib/leads.ts` + `src/pages/api/lead.ts` |
| Design tokens & component classes | `src/styles/global.css` |
| Client boot (reveals, nav, theme, analytics) | `src/scripts/app.ts` |
| Heavy motion (Lenis, GSAP scenes) | `src/scripts/motion.ts` |
| Articles (content collection) | `src/content/learn/*.md` |
| Design contract for new pages | `DESIGN-SYSTEM.md` |

## Leads

`POST /api/lead` — JSON. Validated server-side (PK phone normalization),
honeypot + min-time trap + per-IP rate limit. With `RESEND_API_KEY`: delivers a
formatted email to `LEAD_TO_EMAIL` with one-tap WhatsApp/call links. Without:
**dry-run** — appends to `.leads/leads.jsonl` and logs, so the whole funnel is
testable before keys exist. Client forms always preserve user input on failure
and offer WhatsApp/email fallbacks.

## The placeholder-phone gate

Until `site.phone.live = true`, every WhatsApp/call CTA routes to the quote
funnel instead of a dead number — no lead is ever lost to an unprovisioned
number. Flip one flag when the number exists (CONTENT-TODO.md §1).

## Content honesty rules

No invented reviews, stats, certifications, team members, or install photos.
Volatile numbers are ranges with an as-of date (`PRICES_AS_OF`) and "confirmed
at your free survey" phrasing. See DESIGN-SYSTEM.md §4 and IMAGE-MANIFEST.md
(photo licenses + required credits).

## Docs index

- `CONTENT-TODO.md` — what the owner must supply, in priority order
- `DESIGN-SYSTEM.md` — binding contract for building new pages
- `IMAGE-MANIFEST.md` — every photo, source, license, attribution
- `FACTS.md` — the July 2026 market research behind every number
