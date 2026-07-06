import type { APIRoute } from 'astro';
import { deliverLead, rateLimited, validateLead } from '~/lib/leads';

export const prerender = false;

const json = (data: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let ip = 'unknown';
  try {
    ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || clientAddress || 'unknown';
  } catch {
    /* clientAddress can throw in some adapters */
  }

  if (rateLimited(ip)) {
    return json(
      { ok: false, error: 'Too many requests — please try again in a while, or email us directly.' },
      429
    );
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 12_000) return json({ ok: false, error: 'Request too large.' }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  // Honeypot: a hidden "website" field humans never see. Bots fill it.
  // Answer with a fake success so they move on.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json({ ok: true });
  }

  // Min-time trap: forms mount with a timestamp; instant submits are bots.
  const t = Number(body.t);
  if (Number.isFinite(t) && t > 0 && Date.now() - t < 2000) {
    return json({ ok: true });
  }

  const v = validateLead(body);
  if (!v.ok) return json({ ok: false, error: v.error }, 400);

  const result = await deliverLead(v.lead);
  if (!result.ok) {
    return json(
      {
        ok: false,
        error:
          'We couldn’t send your details just now. Your info is safe in this form — try again, or reach us on WhatsApp.',
      },
      result.status
    );
  }
  return json({ ok: true, dryRun: result.dryRun ?? false });
};

export const GET: APIRoute = () => json({ ok: false, error: 'POST only' }, 405);
