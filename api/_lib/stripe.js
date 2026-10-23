// Cliente mínimo da API do Stripe (sem SDK) + verificação da assinatura do webhook.
import crypto from 'node:crypto';

const API = 'https://api.stripe.com/v1';

/** Converte objeto aninhado no formato de formulário do Stripe: a[b][0][c]=x */
export function toForm(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') toForm(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

export async function stripe(method, path, params) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY não configurada');
  const url = method === 'GET' && params ? `${API}${path}?${toForm(params)}` : `${API}${path}`;
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: method === 'GET' ? undefined : toForm(params || {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Stripe ${res.status}: ${data?.error?.message || 'erro'}`);
  return data;
}

/** Valida o cabeçalho Stripe-Signature (t=…,v1=…) contra o corpo bruto. Tolerância de 5 minutos. */
export function verifyWebhook(rawBody, header, secret, toleranceSec = 300) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=')).filter((p) => p.length === 2).map(([k, v]) => [k.trim(), v.trim()]));
  const sigs = header.split(',').filter((p) => p.trim().startsWith('v1=')).map((p) => p.trim().slice(3));
  const t = Number(parts.t);
  if (!t || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  return sigs.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

/** Lê o corpo bruto da requisição (necessário para validar o webhook). */
export async function readRaw(req) {
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
  return Buffer.concat(chunks).toString('utf8');
}
