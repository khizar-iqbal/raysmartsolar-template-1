/**
 * The savings engine. Pure functions — no DOM. Every output is a
 * labelled ESTIMATE built on assumptions the UI must surface.
 * Model notes reference FACTS.md (research, July 2026).
 */
import {
  RESIDENTIAL_BILL_ANCHORS,
  RESIDENTIAL_MARGINAL_RATE,
  COMMERCIAL_RATE,
  PACKAGES,
  COMMERCIAL_PER_KW,
  BATTERY,
  SELF_USE,
  NET_BILLING,
  HARDWARE,
} from '../data/facts';
import { cities, type City } from '../data/cities';

export type PropertyType = 'home' | 'business';

export interface CalcInput {
  /** Monthly bill in PKR (either bill or units required) */
  bill?: number;
  /** Monthly units (kWh) if the user knows them */
  units?: number;
  citySlug: string;
  type: PropertyType;
  battery: boolean;
}

export interface CalcResult {
  input: Required<Pick<CalcInput, 'citySlug' | 'type' | 'battery'>> & {
    bill: number;
    units: number;
  };
  city: City;
  /** recommended system size, catalog-rounded */
  sizeKw: number;
  panels: number;
  roofSqft: number;
  roofMarla: number;
  monthlyGenUnits: number;
  costLow: number;
  costHigh: number;
  batteryKwh: number;
  newBillLow: number;
  newBillHigh: number;
  savingsLow: number;
  savingsHigh: number;
  savingsPctLow: number;
  savingsPctHigh: number;
  paybackLow: number;
  paybackHigh: number;
  year25Savings: number;
  assumptions: string[];
}

/* ── bill ⇄ units (residential, all-in incl. taxes — estimate) ── */
export function unitsFromBill(bill: number): number {
  const A = RESIDENTIAL_BILL_ANCHORS;
  if (bill <= 0) return 0;
  for (let i = 1; i < A.length; i++) {
    if (bill <= A[i].bill) {
      const a = A[i - 1];
      const b = A[i];
      const f = (bill - a.bill) / (b.bill - a.bill);
      return a.units + f * (b.units - a.units);
    }
  }
  const last = A[A.length - 1];
  return last.units + (bill - last.bill) / RESIDENTIAL_MARGINAL_RATE;
}

export function billFromUnits(units: number): number {
  const A = RESIDENTIAL_BILL_ANCHORS;
  if (units <= 0) return 0;
  for (let i = 1; i < A.length; i++) {
    if (units <= A[i].units) {
      const a = A[i - 1];
      const b = A[i];
      const f = (units - a.units) / (b.units - a.units);
      return a.bill + f * (b.bill - a.bill);
    }
  }
  const last = A[A.length - 1];
  return last.bill + (units - last.units) * RESIDENTIAL_MARGINAL_RATE;
}

/* ── sizing ──────────────────────────────────────────────────── */
const CATALOG = PACKAGES.map((p) => p.kw); // [3,5,7,10,15,20,25]
const MAX_CATALOG = CATALOG[CATALOG.length - 1];

export function recommendSizeKw(unitsMonthly: number, monthlyUnitsPerKw: number): number {
  const raw = unitsMonthly / monthlyUnitsPerKw;
  // pick the smallest catalog size covering the load; large loads scale in 5s
  for (const kw of CATALOG) if (raw <= kw * 1.04) return kw;
  return Math.min(200, Math.ceil(raw / 5) * 5);
}

function systemCost(kw: number, type: PropertyType): { low: number; high: number } {
  const exact = PACKAGES.find((p) => p.kw === kw);
  if (exact) return { low: exact.low, high: exact.high };
  if (kw > MAX_CATALOG) {
    return { low: kw * COMMERCIAL_PER_KW.low, high: kw * COMMERCIAL_PER_KW.high };
  }
  // interpolate between catalog neighbours
  let lo = PACKAGES[0];
  let hi = PACKAGES[PACKAGES.length - 1];
  for (let i = 1; i < PACKAGES.length; i++) {
    if (kw <= PACKAGES[i].kw) {
      lo = PACKAGES[i - 1];
      hi = PACKAGES[i];
      break;
    }
  }
  const f = (kw - lo.kw) / (hi.kw - lo.kw);
  return {
    low: Math.round(lo.low + f * (hi.low - lo.low)),
    high: Math.round(lo.high + f * (hi.high - lo.high)),
  };
}

/* ── the model ───────────────────────────────────────────────── */
export function calculate(input: CalcInput): CalcResult | null {
  const city = cities.find((c) => c.slug === input.citySlug) ?? cities[0];
  const type = input.type;

  let units = input.units ?? 0;
  let bill = input.bill ?? 0;
  if (!units && bill) {
    units = type === 'business' ? bill / COMMERCIAL_RATE.assumed : unitsFromBill(bill);
  }
  if (!bill && units) {
    bill = type === 'business' ? units * COMMERCIAL_RATE.assumed : billFromUnits(units);
  }
  units = Math.round(units);
  bill = Math.round(bill);
  if (units < 50) return null;

  const sizeKw = recommendSizeKw(units, city.monthlyUnitsPerKw);
  const gen = Math.round(sizeKw * city.monthlyUnitsPerKw);

  // Self-consumption split (FACTS cross-cutting: net billing rewards self-use)
  const selfShare = input.battery
    ? type === 'business'
      ? SELF_USE.businessWithBattery
      : SELF_USE.homeWithBattery
    : type === 'business'
      ? SELF_USE.businessDay
      : SELF_USE.homeDay;

  const selfConsumed = Math.min(gen * selfShare, units);
  const exported = Math.max(gen - selfConsumed, 0);
  const remainingImport = Math.max(units - selfConsumed, 0);

  const exportCredit = exported * NET_BILLING.exportRateAssumed;

  // New bill: re-run the remaining imports through the FULL slab curve.
  // This captures the honest "slab escape" effect — cutting grid units
  // also drops the rate you pay on every unit you still buy.
  const newBillCore =
    type === 'business'
      ? remainingImport * COMMERCIAL_RATE.assumed
      : billFromUnits(remainingImport);
  const newBillMid = Math.max(newBillCore - exportCredit, 500);
  const newBillLow = Math.round(Math.max(newBillMid * 0.85, 400) / 100) * 100;
  const newBillHigh = Math.round((newBillMid * 1.3 + 300) / 100) * 100;

  const savingsHigh = Math.max(bill - newBillLow, 0);
  const savingsLow = Math.max(bill - newBillHigh, 0);

  // Cost
  const base = systemCost(sizeKw, type);
  const batteryKwh = input.battery ? (sizeKw >= 10 ? 10 : 5) : 0;
  const battLow = (batteryKwh / 5) * BATTERY.per5kwhLow;
  const battHigh = (batteryKwh / 5) * BATTERY.per5kwhHigh;
  const costLow = base.low + battLow;
  const costHigh = base.high + battHigh;

  // Payback (guard against tiny savings)
  const annualLow = savingsLow * 12;
  const annualHigh = savingsHigh * 12;
  const paybackLow = annualHigh > 0 ? costLow / annualHigh : 99;
  const paybackHigh = annualLow > 0 ? costHigh / annualLow : 99;

  const midMonthly = (savingsLow + savingsHigh) / 2;
  const year25Savings = Math.round((midMonthly * 12 * 25) / 100_000) * 100_000;

  const avgRate = units > 0 ? bill / units : 0;
  const assumptions = [
    `${city.name} yield ≈ ${city.monthlyUnitsPerKw} units per kW per month (annual average, Global Solar Atlas).`,
    `Your average all-in grid rate ≈ Rs ${Math.round(avgRate)}/unit at ${units.toLocaleString('en-PK')} units (estimated from mid-2026 tariffs incl. taxes). Cutting grid units also pulls you into cheaper slabs — the model accounts for that.`,
    `${Math.round(selfShare * 100)}% of solar generation used directly${input.battery ? ' (with evening battery storage)' : ' (daytime use, no battery)'}.`,
    `Exports credited at Rs ${NET_BILLING.exportRateAssumed}/unit — a conservative figure inside NEPRA's floating ${NET_BILLING.exportRateRange} band under the 2026 net-billing rules.`,
    `System prices are ${''}turnkey Tier-1 market bands (as of July 2026) — your exact quote is locked after the free survey.`,
    `Excludes net-metering government fees (Rs ${NET_BILLING.nepraFeePerKw.toLocaleString('en-PK')}/kW NEPRA fee + meter cost ${NET_BILLING.meterCostRange}) — always itemised in your written quote.`,
  ];

  return {
    input: { citySlug: city.slug, type, battery: input.battery, bill, units },
    city,
    sizeKw,
    panels: Math.ceil((sizeKw * 1000) / HARDWARE.panelWattTypical),
    roofSqft: Math.round(sizeKw * 55),
    roofMarla: Math.round((sizeKw * 55) / 225 * 10) / 10,
    monthlyGenUnits: gen,
    costLow,
    costHigh,
    batteryKwh,
    newBillLow,
    newBillHigh,
    savingsLow: Math.round(savingsLow),
    savingsHigh: Math.round(savingsHigh),
    savingsPctLow: bill ? Math.round((savingsLow / bill) * 100) : 0,
    savingsPctHigh: bill ? Math.min(Math.round((savingsHigh / bill) * 100), 99) : 0,
    paybackLow: Math.round(paybackLow * 10) / 10,
    paybackHigh: Math.round(paybackHigh * 10) / 10,
    year25Savings,
    assumptions,
  };
}

/* ── formatting helpers shared by calculator + funnel UIs ────── */
export const fmtRs = (n: number) => `Rs ${Math.round(n).toLocaleString('en-PK')}`;

export function fmtRsCompact(n: number): string {
  if (n >= 10_000_000) return `Rs ${(n / 10_000_000).toFixed(n % 10_000_000 === 0 ? 0 : 1)} crore`;
  if (n >= 100_000) return `Rs ${(n / 100_000).toFixed(n % 100_000 === 0 ? 0 : 1)} lakh`;
  return fmtRs(n);
}

/** Pre-filled WhatsApp message carrying calculator context. */
export function waMessageFromResult(r: CalcResult): string {
  const batt = r.batteryKwh ? ` + ${r.batteryKwh}kWh battery` : '';
  return (
    `Assalam-o-alaikum RaySmartSolar! I used your savings calculator.\n` +
    `• City: ${r.city.name} (${r.city.disco.code})\n` +
    `• ${r.input.type === 'home' ? 'Home' : 'Business'}, bill ~${fmtRs(r.input.bill)}/month\n` +
    `• Suggested: ${r.sizeKw} kW${batt} (~${fmtRsCompact(r.costLow)}–${fmtRsCompact(r.costHigh)})\n` +
    `• Est. new bill: ${fmtRs(r.newBillLow)}–${fmtRs(r.newBillHigh)}\n` +
    `Can you check these numbers for my roof?`
  );
}
