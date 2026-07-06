/**
 * ═══════════════════════════════════════════════════════════════
 * RaySmartSolar — single source of truth for identity & contact.
 *
 * EVERY appearance of the company name, address, email, phone and
 * WhatsApp number anywhere on the site flows from this file.
 * Local SEO depends on these strings being byte-identical
 * everywhere — edit them HERE and nowhere else.
 * ═══════════════════════════════════════════════════════════════
 */

export const site = {
  name: 'RaySmartSolar',
  legalName: 'RaySmartSolar',
  tagline: 'The sun doesn’t do load-shedding.',
  domain: 'raysmartsolar.com',
  url: import.meta.env.PUBLIC_SITE_URL || 'https://raysmartsolar.com',

  address: {
    // Byte-identical everywhere (NAP consistency).
    full: '2nd Floor, 11-A College Block, Allama Iqbal Town, Lahore',
    street: '2nd Floor, 11-A College Block',
    area: 'Allama Iqbal Town',
    city: 'Lahore',
    region: 'Punjab',
    country: 'Pakistan',
    countryCode: 'PK',
    // Google Maps link — plain link out, no iframe in the critical path.
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent('11-A College Block, Allama Iqbal Town, Lahore'),
  },

  email: 'info@raysmartsolar.com',

  /**
   * ── PHONE / WHATSAPP — PLACEHOLDER ──────────────────────────
   * The real number is not provisioned yet. Swap these two values
   * and flip `live: true` when it is. One edit, whole site updates.
   * While `live` is false, phone/WhatsApp CTAs route to the quote
   * funnel instead of dialing a dead number — no lead ever hits a
   * wrong number. See CONTENT-TODO.md § 1.
   */
  phone: {
    live: false as boolean,
    /** E.164, digits only after +. Used in tel: and wa.me links. */
    e164: '+923000000000',
    /** Human-readable display format. */
    display: '0300 0000000',
    /** Label shown next to the number while live=false. */
    placeholderNote: 'number being provisioned',
  },

  hours: {
    days: 'Monday – Saturday',
    time: '9:00am – 7:00pm',
    note: 'WhatsApp answered late — we know when the thinking happens.',
  },

  /** Home turf. Drives default DISCO, schema, and local copy. */
  homeCity: 'lahore',
  homeDisco: 'LESCO',

  social: {
    // Add real profiles when created — see CONTENT-TODO.md
    facebook: '',
    instagram: '',
    youtube: '',
  },
} as const;

/** WhatsApp deep link with a pre-filled message. */
export function waLink(message: string): string {
  const digits = site.phone.e164.replace(/[^0-9]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const WA_DEFAULT_MESSAGE =
  'Assalam-o-alaikum RaySmartSolar — I’m looking into solar and have a few questions.';

export function telLink(): string {
  return `tel:${site.phone.e164}`;
}
