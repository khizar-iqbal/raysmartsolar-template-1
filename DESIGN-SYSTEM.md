# RaySmartSolar — Design System Contract

This is the binding contract for anyone (human or agent) writing pages.
Deviate from voice, never from structure. When in doubt, copy the patterns in
`src/pages/index.astro`, `src/pages/net-metering.astro` and `src/pages/calculator.astro`.

## 1. The stack on a page

Every page:

```astro
---
import Layout from '~/layouts/Layout.astro';
import PageHero from '~/components/PageHero.astro';
import SectionHead from '~/components/SectionHead.astro';
import CTABand from '~/components/CTABand.astro';
import FAQ from '~/components/FAQ.astro';
import Icon from '~/components/Icon.astro';
// photos only from this folder, already curated + licensed:
import heroImg from '~/assets/photos/<name>.jpg';   // see IMAGE-MANIFEST.md
---
<Layout title="..." description="..." jsonLd={[...]}>
  <PageHero ... />
  <section class="section">…</section>
  …
  <section class="section pt-0">
    <div class="wrap"><CTABand … /></div>
  </section>
</Layout>
```

- `Layout` props: `title` (≤60 chars, ends with `— RaySmartSolar` or `| RaySmartSolar` omitted if too long), `description` (140–160 chars, benefit-led), `jsonLd` (array), `heroNav` (ONLY when PageHero uses an image).
- NEVER hardcode name/address/email/phone — import from `~/config/site` (`site.name`, `site.address.full`, `site.email`, helpers `waLink()`, `telLink()`).
- Numbers (prices, rates, yields) come ONLY from `~/data/facts` and `~/data/cities` — never invent or restate them inline. Volatile figures always appear with `PRICES_AS_OF` and "confirmed at your free survey" phrasing.

## 2. Components API (exact)

- `<PageHero eyebrow title|titleHtml lede image={img} imageAlt imageCredit imagePosition>` + `slot="actions"` for buttons. With `image` → pass `heroNav` to Layout. `imageCredit` REQUIRED for the Wikimedia city images (strings in IMAGE-MANIFEST.md).
- `<SectionHead eyebrow title titleHtml lede align="left|center" />` — `titleHtml` allows `<em>…</em>` for the gold italic accent. Use an accent in at most ~half of your sections.
- `<CTABand heading sub primaryHref primaryLabel primaryIcon evtSrc />` — end every page with one (customise heading/sub per page; primary defaults to the calculator).
- `<FAQ items={[{q, a}]} schema />` — `a` may contain simple HTML links. `schema` on ONE faq block per page max.
- `<Icon name="…" size={18} class="text-gold" />` — available names: sun, sunrise, bolt, meter, home, building, battery, shield, filecheck, wrench, banknote, whatsapp, phone, mail, pin, arrow-right, arrow-up-right, chevron-down, check, x, moon, calculator, clock, download, panel, sparkle, fan, gauge, layers, trending, users, leaf, alert. NEVER emoji-as-icon, never other icon sets.
- `<Prose>` for long-form only (articles/legal).

## 3. Layout & motion classes

- Wrapper: `<div class="wrap">` (max-w 74rem). Sections: `<section class="section">` (`pt-0` to tighten after a related block).
- Cards: `class="card p-6"` (or p-7). Buttons: `btn btn-gold|btn-ghost|btn-wa` + `btn-sm|btn-lg`.
- Reveals: put `data-reveal` on single blocks; `data-reveal-group` on a parent + `data-reveal-child` on children for stagger. Do NOT invent other animation code. No raw scroll listeners.
- Numbers/stats: `mono-num` class, gold via `text-accent`, money-green via `text-money`.
- Night-bookend sections (rare, for drama): `class="section theme-night"`.
- KPI/stat pattern: see index.astro "honest numbers" cards. Counters: `<span data-count-to="90">0</span>`.

## 4. Voice (this is what makes us us)

- Plain, warm, specific, lightly wry. Short sentences. Zero corporate filler.
- BANNED words/phrases: elevate, seamless, solutions, empower, unlock, cutting-edge, state-of-the-art, "your trusted partner", "we believe", journey (as noun for buying), revolutionize.
- Answer the money question in the first screen of every page.
- Honesty converts: ranges not promises, assumptions stated, downsides named (winter/smog output, DISCO delays, small-bill payback).
- Roman-Urdu accents sparingly for warmth: "Assalam-o-alaikum", "koi zabardasti nahi", "bijli ka bill", "roshan rahiye". Max 1–2 per page. `lang="ur-Latn"` attribute where used.
- 2026 reality (from FACTS.md — critical): net metering is now NET BILLING for new connections (exports ~Rs 8–13/unit, imports at full retail). We design for self-consumption first. Never sell the old 1:1 story. Grandfathered consumers keep old terms until agreement expiry; expansion voids it.
- NEVER fabricate: reviews, testimonials, client names, team members, stats about us ("X MW installed"), certifications we haven't confirmed. Placeholder structures use the `todo-chip` pattern (see index.astro cert bar) + a `<!-- TODO: ... see CONTENT-TODO.md -->` comment.

## 5. Conversion rules

- One dominant gold CTA per screenful; ghost secondary at most.
- Every page: CTABand at the end + at least one contextual CTA mid-page.
- WhatsApp: never hardcode wa.me — use `site.phone.live ? waLink(msg) : '/quote?src=<page>'` pattern (copy from CTABand/Footer).
- Analytics: interactive/CTA elements get `data-evt="<event>"` (+ `data-evt-src`). Event names: wa_click, tel_click, calc_open, quote_open, guide_open, cta_primary, plus page-specific like `city_calc`.
- Internal links: calculator with prefill `/calculator?city=<slug>&type=home|business&bill=25000`.

## 6. SEO

- One `<h1>` per page (PageHero provides it). Sections use h2/h3 in order.
- `jsonLd`: Service pages → `{'@type':'Service', name, description, provider:{'@id': site.url + '/#business'}, areaServed:[...]}`. City pages → Service + BreadcrumbList. Articles → Article.
- Titles follow real search language: "5kW Solar Price", "Net Metering in Lahore", etc.

## 7. Photos

Only files listed in IMAGE-MANIFEST.md, imported from `~/assets/photos/*.jpg` and rendered through `<Image>` (astro:assets) or `PageHero`. Content-width images: `widths={[480, 800, 1200]}`, `sizes="(min-width: 768px) 50vw, 100vw"`, `format="avif"`, `quality={60}`, `loading="lazy"`, wrapped in `<figure class="ph rounded-2xl">`. Wikimedia images MUST render their credit string (manifest) as a small caption: `<figcaption class="text-[0.62rem] font-mono text-ink-3 mt-2">Photo: … · CC BY-SA 4.0 · Wikimedia Commons</figcaption>`.

## 8. Syntax gotchas (Astro)

- Frontmatter strings with apostrophes: prefer typographic ’ inside copy text; in JS strings use `'…'` with `’` (never unescaped `'`).
- `set:html` only with trusted local strings.
- No `client:*` directives anywhere (no framework components exist). Interactivity = plain `<script>` at file end following calculator.astro's pattern with `document.addEventListener('astro:page-load', init)` + idempotence guard (`if (el.dataset.bound) return;`).
- Don't import motion.ts/GSAP directly — data attributes only.
- Astro scoped styles: to style a child component element use `:global()`.
