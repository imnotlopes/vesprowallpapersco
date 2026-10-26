// POST /api/resend-links {email} → procura os pedidos pagos desse e-mail no Stripe e registra
// "Requested Download Links" no Klaviyo com os links (o fluxo manda o e-mail).
// Resposta sempre igual (não revela se o e-mail comprou ou não).
import { stripe } from './_lib/stripe.js';
import { itemsFor } from './_lib/links.js';
import { orderProducts, normalizeCart } from './_lib/products.js';
import { trackEvent, validEmail, METRICS } from './_lib/klaviyo.js';
import { productCard, recommendations } from './_lib/email-data.js';
import { allow, ipOf, jsonBody, MIN, HOUR } from './_lib/limit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const b = jsonBody(req);
  if (!b) return res.status(400).json({ ok: false, error: 'Invalid request.' });
  const email = String(b.email || '').trim().toLowerCase();
  if (!validEmail(email)) return res.status(400).json({ ok: false, error: 'Please enter a valid email.' });
  // até 5 pedidos a cada 10 min por IP; o mesmo e-mail recebe no máximo 3 reenvios por hora (depois, mesma resposta sem reenviar)
  if (!allow(`resend:ip:${ipOf(req)}`, 5, 10 * MIN)) return res.status(429).json({ ok: false, error: 'Too many requests. Please wait a few minutes and try again.' });
  if (!allow(`resend:mail:${email}`, 3, HOUR)) return res.status(200).json({ ok: true });
  try {
    const found = await stripe('GET', '/checkout/sessions/search', { query: `customer_details.email:"${email.replace(/"/g, '')}" AND status:"complete"`, limit: 50 })
      .catch(() => stripe('GET', '/checkout/sessions', { 'customer_details[email]': email, limit: 100 }));
    const keys = normalizeCart((found.data || []).filter((s) => s.payment_status === 'paid').flatMap((s) => orderProducts(s.metadata)));
    const items = itemsFor(keys);
    if (items.length) {
      await trackEvent({ email, metric: METRICS.resend, properties: {
        ItemNames: items.map((i) => i.name),
        Items: items.map((i) => ({ ...productCard(i.key), DownloadLink: i.link })),
        Recommendations: recommendations(keys),
      } });
    }
  } catch (e) {
    console.error(e);
  }
  return res.status(200).json({ ok: true });
}
