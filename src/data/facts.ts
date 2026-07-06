/**
 * ═══════════════════════════════════════════════════════════════
 * Curated market facts — the single source for every number that
 * appears anywhere on the site. Each constant cites FACTS.md
 * (research file, July 2026) by section. When the market moves,
 * update HERE and the whole site follows.
 *
 * Rule: anything volatile is expressed as a RANGE with an as-of
 * date, and pages must pair it with "confirmed at your free survey".
 * ═══════════════════════════════════════════════════════════════
 */

/** Shown next to every price/rate that can move. */
export const PRICES_AS_OF = 'July 2026';

/* ── Net billing (FACTS §1) ─────────────────────────────────── */
export const NET_BILLING = {
  /** NEPRA (Prosumer) Regulations 2026 — notified 9 Feb 2026 */
  regsName: 'NEPRA (Prosumer) Regulations, 2026',
  effectiveDate: '9 February 2026',
  /** Export rate is NAEPP-linked and floating; reported Rs 8–13. */
  exportRateRange: 'Rs 8–13',
  /** Conservative figure used in calculator math. */
  exportRateAssumed: 9,
  /** Old-regime buyback for grandfathered consumers (~Rs 25–27). */
  legacyBuyback: 'Rs 25–27',
  agreementYears: 5,
  capMw: 1,
  sanctionedLoadRule: 'system size may not exceed your sanctioned load',
  transformerRule: 'new connections pause once a transformer hits 80% solar',
  nepraFeePerKw: 1000, // Rs, non-refundable, all sizes (Apr 2026)
  meterCostRange: 'Rs 18,500–70,000', // conflicting reports; quote range only
  /** Regulatory clock vs reality (FACTS §1.5) */
  approvalReality: 'typically 4–14 weeks depending on the DISCO’s workload',
} as const;

/* ── Tariffs (FACTS §2) — anchor points for the calculator ───── */
/**
 * All-in monthly bill estimates (unprotected residential, incl.
 * taxes/FCA/surcharges), mid-2026. Interpolated linearly between
 * anchors. LABEL AS ESTIMATE wherever surfaced.
 */
export const RESIDENTIAL_BILL_ANCHORS: Array<{ units: number; bill: number }> = [
  { units: 0, bill: 0 },
  { units: 100, bill: 2600 },
  { units: 200, bill: 6700 },
  { units: 300, bill: 11250 },
  { units: 500, bill: 21750 },
  { units: 800, bill: 48000 },
  { units: 1200, bill: 72000 },
];
/** Marginal all-in Rs/unit beyond the last anchor. */
export const RESIDENTIAL_MARGINAL_RATE = 60;

/** Commercial all-in effective rate band (Rs/unit), mid-2026. */
export const COMMERCIAL_RATE = { low: 45, high: 60, assumed: 52 } as const;

export const TARIFF_NOTE =
  'Grid tariffs are revised every year and adjusted monthly. Most Lahore households above 200 units pay roughly Rs 35–65 per unit all-in once taxes land.';

/* ── System prices, turnkey Tier-1 (FACTS §3.1) ──────────────── */
export interface PackageBand {
  kw: number;
  low: number; // PKR, on-grid turnkey
  high: number;
  /** typical monthly units this size covers in central Punjab */
  unitsLow: number;
  unitsHigh: number;
  /** all-in monthly bill range it usually suits (residential) */
  billLow: number;
  billHigh: number;
}

export const PACKAGES: PackageBand[] = [
  { kw: 3, low: 350_000, high: 550_000, unitsLow: 300, unitsHigh: 400, billLow: 11_000, billHigh: 17_000 },
  { kw: 5, low: 550_000, high: 900_000, unitsLow: 500, unitsHigh: 650, billLow: 20_000, billHigh: 33_000 },
  { kw: 7, low: 750_000, high: 1_150_000, unitsLow: 700, unitsHigh: 900, billLow: 40_000, billHigh: 55_000 },
  { kw: 10, low: 950_000, high: 1_500_000, unitsLow: 1_000, unitsHigh: 1_300, billLow: 58_000, billHigh: 80_000 },
  { kw: 15, low: 1_400_000, high: 1_900_000, unitsLow: 1_500, unitsHigh: 1_950, billLow: 88_000, billHigh: 120_000 },
  { kw: 20, low: 1_800_000, high: 2_200_000, unitsLow: 2_000, unitsHigh: 2_600, billLow: 118_000, billHigh: 160_000 },
  { kw: 25, low: 2_300_000, high: 2_800_000, unitsLow: 2_500, unitsHigh: 3_250, billLow: 148_000, billHigh: 200_000 },
];

/** Larger commercial sizing continues past the catalog. */
export const COMMERCIAL_PER_KW = { low: 88_000, high: 110_000 } as const; // Rs/kW at 50–100 kW scale

/* ── Batteries & hybrid (FACTS §3.3) ─────────────────────────── */
export const BATTERY = {
  /** Rs per ~5 kWh LiFePO4 module incl. hybrid-inverter delta */
  per5kwhLow: 300_000,
  per5kwhHigh: 500_000,
  perKwhNote: 'reputable LiFePO4 runs ~Rs 40–55k per kWh',
  brands: ['Pylontech', 'Dyness', 'GoodWe Lynx', 'Knox', 'BYD'],
} as const;

/* ── Hardware (FACTS §3.2, §3.4) ─────────────────────────────── */
export const HARDWARE = {
  panelBrands: ['Jinko', 'LONGi', 'JA Solar', 'Canadian Solar'],
  panelPerWatt: 'Rs 40–48',
  panelWattTypical: 615, // N-type 585–645W class; used for panel counts
  inverterBrands: ['Huawei', 'Sungrow', 'GoodWe', 'Solis', 'Growatt'],
  panelWarranty: { performanceYears: 25, productYears: 12 },
  inverterWarrantyYears: '5–10',
} as const;

/* ── Yield & self-consumption model (FACTS §4, §Cross-cutting) ─ */
export const SELF_USE = {
  homeDay: 0.35, // share of generation consumed directly, no battery
  homeWithBattery: 0.7,
  businessDay: 0.6, // daytime-heavy operations, 6-day weeks
  businessWithBattery: 0.75,
} as const;

export const PERFORMANCE_NOTE =
  'Yields assume a clean, unshaded, properly-tilted install. Lahore winters and smog season can halve daily output vs June — we size on honest year-round numbers.';

/* ── Payback & savings framing (FACTS cross-cutting) ─────────── */
export const PAYBACK_TYPICAL = '3–5 years';
export const BILL_CUT_TYPICAL = '70–90%';

/* ── Taxes (FACTS §3.5) ──────────────────────────────────────── */
export const TAX_NOTE =
  'Solar taxes are reviewed in every federal budget (panels currently carry 10% GST; the proposed 2026 increase was dropped). Our quotes show the tax line separately.';

/* ── Market scale (FACTS §9 — attribute when quoted) ─────────── */
export const MARKET = {
  imports2024Gw: 17,
  importsRank: 'the world’s third-largest solar panel importer (2024, Ember)',
  operationalGwMar2026: 51,
  netMeteredConsumers: '283,000+ (Dec 2024)',
} as const;

/* ── Financing (FACTS §7) ────────────────────────────────────── */
export const FINANCING = {
  banks: [
    { name: 'Meezan Bank', model: 'Islamic — Diminishing Musharakah', note: 'consumer solar financing with online calculator' },
    { name: 'Bank Alfalah', model: 'Alfalah Green Energy', note: 'systems from 4 kW; KIBOR-linked markup' },
    { name: 'JS Bank', model: 'GCF-backed solar lending', note: 'tenors up to 10 years for businesses' },
  ],
  markupContext: 'markups track KIBOR — roughly 15–22%/yr in mid-2026',
  sbpSchemeStatus: 'the old SBP concessional solar scheme ended in 2023 — anyone advertising it is out of date',
  commercial: ['Outright purchase', 'Bank financing', 'Lease / Ijarah (50–500 kW sweet spot)', 'PPA / BOOT — pay per unit, zero upfront (500 kW+)'],
} as const;

/* ── Certification (FACTS §8.1) ──────────────────────────────── */
export const CERTIFICATION_NOTE =
  'PPIB (formerly AEDB) certifies solar installers in categories C-1 to C-3 — always ask for the certificate number and check it on ppib.gov.pk.';
