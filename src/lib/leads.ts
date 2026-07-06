/**
 * Lead intake: validation, spam defense, delivery.
 * With RESEND_API_KEY set, leads are emailed to LEAD_TO_EMAIL.
 * Without it (dry-run), leads are logged to .leads/leads.jsonl so the
 * whole funnel is testable before the owner adds a key.
 */
import { appendFile, mkdir } from 'node:fs/promises';

export type LeadKind = 'quote' | 'contact' | 'callback' | 'guide' | 'calculator';

export interface LeadInput {
  kind: LeadKind;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  propertyType?: string;
  bill?: number;
  roof?: string;
  timeline?: string;
  backup?: string;
  message?: string;
  calc?: string; // human-readable calculator snapshot
  page?: string;
  /** honeypot — must be empty */
  website?: string;
  /** ms timestamp set when the form mounted (min-time trap) */
  t?: number;
}

export interface LeadResult {
  ok: boolean;
  dryRun?: boolean;
  error?: string;
  status: number;
}

/* ── Rate limiting (in-memory, per process) ──────────────────── */
const buckets = new Map<string, { count: number; reset: number }>();
const LIMIT = 6;
const WINDOW = 60 * 60 * 1000;

export function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.reset) {
    buckets.set(ip, { count: 1, reset: now + WINDOW });
    return false;
  }
  b.count += 1;
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
  }
  return b.count > LIMIT;
}

/* ── Validation ──────────────────────────────────────────────── */
const KINDS: LeadKind[] = ['quote', 'contact', 'callback', 'guide', 'calculator'];

const clean = (v: unknown, max = 300): string =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '';

const hasUrl = (s: string) => /https?:\/\/|www\.|\.(com|net|org|io|ru|cn)\b/i.test(s);

export function normalizePkPhone(raw: string): string | null {
  const d = raw.replace(/[^\d+]/g, '');
  let m = d.match(/^(?:\+?92|0)?(3\d{9})$/);
  if (m) return `+92${m[1]}`;
  // Landlines: 9–10 digits after area code, accept loosely
  m = d.match(/^(?:\+?92|0)([1-9]\d{8,9})$/);
  if (m) return `+92${m[1]}`;
  return null;
}

export function validateLead(body: Record<string, unknown>):
  | { ok: true; lead: Required<Pick<LeadInput, 'kind' | 'name' | 'phone'>> & LeadInput }
  | { ok: false; error: string } {
  const kind = clean(body.kind, 20) as LeadKind;
  if (!KINDS.includes(kind)) return { ok: false, error: 'Invalid request.' };

  const name = clean(body.name, 80);
  if (name.length < 2) return { ok: false, error: 'Please tell us your name.' };
  if (hasUrl(name)) return { ok: false, error: 'Please check your name.' };

  // Guide downloads may come with email only; everything else needs a phone.
  const phoneRaw = clean(body.phone, 25);
  const email = clean(body.email, 120);
  let phone = '';
  if (phoneRaw) {
    const normalized = normalizePkPhone(phoneRaw);
    if (!normalized)
      return { ok: false, error: 'That phone number doesn’t look right — 03XX XXXXXXX works best.' };
    phone = normalized;
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    return { ok: false, error: 'That email doesn’t look right.' };
  if (!phone && kind !== 'guide')
    return { ok: false, error: 'A phone number is needed so we can reach you.' };
  if (!phone && !email) return { ok: false, error: 'We need a phone number or email.' };

  const bill = Number(body.bill);
  const message = clean(body.message, 2000);

  return {
    ok: true,
    lead: {
      kind,
      name,
      phone,
      email: email || undefined,
      city: clean(body.city, 40) || undefined,
      propertyType: clean(body.propertyType, 30) || undefined,
      bill: Number.isFinite(bill) && bill > 0 ? Math.round(bill) : undefined,
      roof: clean(body.roof, 60) || undefined,
      timeline: clean(body.timeline, 60) || undefined,
      backup: clean(body.backup, 60) || undefined,
      message: message || undefined,
      calc: clean(body.calc, 1200) || undefined,
      page: clean(body.page, 200) || undefined,
    },
  };
}

/* ── Email rendering ─────────────────────────────────────────── */
const PKT = new Intl.DateTimeFormat('en-PK', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Karachi',
});

const KIND_LABEL: Record<LeadKind, string> = {
  quote: 'Quote request',
  contact: 'Contact message',
  callback: 'Call-back request',
  guide: 'Buyer’s guide download',
  calculator: 'Calculator handoff',
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderLeadEmail(lead: LeadInput & { name: string; phone: string }) {
  const rows: Array<[string, string | undefined]> = [
    ['Name', lead.name],
    ['Phone', lead.phone],
    ['Email', lead.email],
    ['City', lead.city],
    ['Property', lead.propertyType],
    ['Monthly bill', lead.bill ? `Rs ${lead.bill.toLocaleString('en-PK')}` : undefined],
    ['Roof', lead.roof],
    ['Timeline', lead.timeline],
    ['Backup interest', lead.backup],
    ['Message', lead.message],
    ['Calculator', lead.calc],
    ['Source page', lead.page],
    ['Received', PKT.format(new Date()) + ' PKT'],
  ];
  const filled = rows.filter(([, v]) => v);

  const subjectBits = [
    KIND_LABEL[lead.kind],
    lead.city,
    lead.bill ? `Rs ${Math.round(lead.bill / 1000)}k/mo` : null,
    lead.name,
  ].filter(Boolean);
  const subject = `New lead — ${subjectBits.join(' — ')}`;

  const waDigits = lead.phone.replace(/[^0-9]/g, '');
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f5f2ea;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#1c1b22">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5decb">
    <div style="background:#0a0f1e;padding:18px 24px">
      <p style="margin:0;color:#f2a63c;font-size:12px;letter-spacing:2px;text-transform:uppercase">RaySmartSolar</p>
      <h1 style="margin:6px 0 0;color:#f2edde;font-size:20px">${esc(KIND_LABEL[lead.kind])}</h1>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${filled
        .map(
          ([k, v]) => `<tr>
        <td style="padding:10px 24px;border-bottom:1px solid #f0ead9;color:#85838d;white-space:nowrap;vertical-align:top">${esc(k)}</td>
        <td style="padding:10px 24px;border-bottom:1px solid #f0ead9;font-weight:600;white-space:pre-wrap">${esc(String(v))}</td>
      </tr>`
        )
        .join('')}
    </table>
    <div style="padding:18px 24px 24px">
      ${
        lead.phone
          ? `<a href="https://wa.me/${waDigits}" style="display:inline-block;background:#25d366;color:#08351d;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:999px;margin-right:8px">WhatsApp them</a>
             <a href="tel:${esc(lead.phone)}" style="display:inline-block;background:#f2a63c;color:#201405;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:999px">Call them</a>`
          : ''
      }
      <p style="color:#85838d;font-size:12px;margin:16px 0 0">Reply fast — solar shoppers usually have other tabs open.</p>
    </div>
  </div>
</body></html>`;

  const text =
    `${KIND_LABEL[lead.kind]}\n` +
    filled.map(([k, v]) => `${k}: ${v}`).join('\n') +
    (lead.phone ? `\n\nWhatsApp: https://wa.me/${waDigits}` : '');

  return { subject, html, text };
}

/* ── Delivery ────────────────────────────────────────────────── */
export async function deliverLead(
  lead: LeadInput & { name: string; phone: string }
): Promise<LeadResult> {
  const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  const to = import.meta.env.LEAD_TO_EMAIL || process.env.LEAD_TO_EMAIL || 'info@raysmartsolar.com';
  const from =
    import.meta.env.LEAD_FROM_EMAIL ||
    process.env.LEAD_FROM_EMAIL ||
    'RaySmartSolar Leads <onboarding@resend.dev>';

  const { subject, html, text } = renderLeadEmail(lead);

  if (!apiKey) {
    // DRY RUN — no key yet. Log it so nothing is ever lost.
    try {
      await mkdir('.leads', { recursive: true });
      await appendFile(
        '.leads/leads.jsonl',
        JSON.stringify({ at: new Date().toISOString(), ...lead }) + '\n'
      );
    } catch (e) {
      console.error('[lead:dry-run] could not write .leads/leads.jsonl', e);
    }
    console.log(`[lead:dry-run] ${subject}`);
    return { ok: true, dryRun: true, status: 200 };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: lead.email ? [lead.email] : undefined,
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[lead] resend error', res.status, detail);
      return { ok: false, error: 'delivery_failed', status: 502 };
    }
    return { ok: true, status: 200 };
  } catch (e) {
    console.error('[lead] delivery exception', e);
    return { ok: false, error: 'delivery_failed', status: 502 };
  }
}
