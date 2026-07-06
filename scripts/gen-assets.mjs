import sharp from 'sharp';

const og = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFD27A"/><stop offset="1" stop-color="#F2A63C"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="1.1" r="1">
      <stop offset="0" stop-color="#F2A63C" stop-opacity="0.34"/>
      <stop offset="0.55" stop-color="#F2A63C" stop-opacity="0.07"/>
      <stop offset="1" stop-color="#F2A63C" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="skyline" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0A0F1E" stop-opacity="0"/>
      <stop offset="1" stop-color="#060A15"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0A0F1E"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <!-- panel grid silhouette -->
  <g opacity="0.20" stroke="#F2EDDE" stroke-width="2">
    <path d="M700 630 L1040 430 L1200 430 L1200 630 Z" fill="#101828"/>
    <path d="M760 594 L1052 424" /><path d="M840 630 L1120 466"/><path d="M950 630 L1176 497"/>
    <path d="M737 560 L1200 560"/><path d="M795 525 L1200 525"/><path d="M851 492 L1200 492"/><path d="M908 458 L1200 458"/>
  </g>
  <rect y="470" width="1200" height="160" fill="url(#skyline)"/>
  <!-- sun mark -->
  <g transform="translate(96,88) scale(3.4)">
    <path d="M8.4 20a7.6 7.6 0 1 1 15.2 0Z" fill="url(#sun)"/>
    <path d="M16 6.2V3.4M8.9 9.1 7 7.2M23.1 9.1 25 7.2M5.8 14.6l-2.6-.7M26.2 14.6l2.6-.7" stroke="url(#sun)" stroke-width="2" stroke-linecap="round"/>
    <path d="M4 24h24" stroke="#F2EDDE" stroke-width="2" stroke-linecap="round" opacity="0.9"/>
    <path d="M9 28h14" stroke="#F2EDDE" stroke-width="2" stroke-linecap="round" opacity="0.35"/>
  </g>
  <text x="222" y="163" font-family="Helvetica Neue, Arial, sans-serif" font-size="46" font-weight="700" fill="#F2EDDE"><tspan fill="#F2A63C">Ray</tspan>SmartSolar</text>
  <text x="96" y="330" font-family="Georgia, serif" font-size="76" fill="#F2EDDE">The sun doesn’t</text>
  <text x="96" y="418" font-family="Georgia, serif" font-size="76" fill="#F2EDDE">do load-shedding.</text>
  <text x="96" y="500" font-family="Helvetica Neue, Arial, sans-serif" font-size="28" fill="#A8ABBC">Solar, done properly — honest numbers, paperwork handled.</text>
  <text x="96" y="566" font-family="Courier New, monospace" font-size="24" letter-spacing="4" fill="#F2A63C">RAYSMARTSOLAR.COM · LAHORE</text>
</svg>`;

await sharp(Buffer.from(og)).png().toFile('public/og-default.jpg'.replace('.jpg','.png'))
  .catch(e => { console.error(e); process.exit(1); });
// also jpg (smaller, og standard ok)
await sharp(Buffer.from(og)).flatten({background:'#0A0F1E'}).jpeg({quality: 88}).toFile('public/og-default.jpg');

// apple-touch-icon from favicon svg (opaque bg required)
import { readFileSync } from 'node:fs';
const fav = readFileSync('public/favicon.svg');
await sharp(fav, { density: 320 }).resize(180, 180).flatten({ background: '#0A0F1E' }).png().toFile('public/apple-touch-icon.png');

console.log('assets done');
