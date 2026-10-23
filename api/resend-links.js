// POST /api/resend-links {email} → procura os pedidos pagos desse e-mail no Stripe e registra
// "Requested Download Links" no Klaviyo com os links (o fluxo manda o e-mail).
// Resposta sempre igual (não revela se o e-mail comprou ou não).
import { stripe } from './_lib/stripe.js';
import { itemsFor } from './_lib/links.js';
import { orderProducts, normalizeCart } from './_lib/products.js';
import { trackEvent, validEmail, METRICS } from './_lib/klaviyo.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const email = String(b.email || '').trim().toLowerCase();
  if (!validEmail(email)) return res.status(400).json({ ok: false, error: 'Please enter a valid email.' });
  try {
    const found = await stripe('GET', '/checkout/sessions/search', { query: `customer_details.email:"${email.replace(/"/g, '')}" AND status:"complete"`, limit: 50 })
      .catch(() => stripe('GET', '/checkout/sessions', { 'customer_details[email]': email, limit: 100 }));
    const keys = normalizeCart((found.data || []).filter((s) => s.payment_status === 'paid').flatMap((s) => orderProducts(s.metadata)));
    const items = itemsFor(keys);
    if (items.length) {
      await trackEvent({ email, metric: METRICS.resend, properties: {
        ItemNames: items.map((i) => i.name),
        Items: items.map((i) => ({ ProductID: i.key, ProductName: i.name, DownloadLink: i.link })),
      } });
    }
  } catch (e) {
    console.error(e);
  }
  return res.status(200).json({ ok: true });
}
