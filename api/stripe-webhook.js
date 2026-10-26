// POST /api/stripe-webhook — evento checkout.session.completed (pago) → evento "Placed Order" no Klaviyo
// com os links de download (o fluxo do Klaviyo manda o e-mail). Assinatura validada com STRIPE_WEBHOOK_SECRET.
import { verifyWebhook, readRaw, stripe } from './_lib/stripe.js';
import { itemsFor } from './_lib/links.js';
import { orderProducts, PRODUCTS, formatPrice } from './_lib/products.js';
import { trackEvent, METRICS } from './_lib/klaviyo.js';
import { productCard, recommendations } from './_lib/email-data.js';

/** Preço pago por produto (centavos). Um item só: o subtotal do pedido; vários: as linhas do pedido no Stripe.
 *  Se a consulta falhar, o e-mail sai sem o preço de cada item (o total continua certo). */
async function paidPrices(s, keys) {
  if (keys.length === 1) return { [keys[0]]: s.amount_subtotal ?? s.amount_total ?? 0 };
  try {
    const lines = (await stripe('GET', `/checkout/sessions/${s.id}/line_items`, { limit: 20 })).data || [];
    return Object.fromEntries(keys.map((k) => [k, lines.find((l) => (l.description || '').startsWith(PRODUCTS[k].name))?.amount_total])
      .filter(([, v]) => typeof v === 'number'));
  } catch (e) {
    console.error(e);
    return {};
  }
}
const money = (cents) => (typeof cents === 'number' ? formatPrice(cents) : '');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const raw = await readRaw(req);
  if (!verifyWebhook(raw, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET)) {
    return res.status(400).send('Invalid signature');
  }
  const event = JSON.parse(raw);
  const s = event.data?.object;
  const paid = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type) && s?.payment_status === 'paid';
  if (!paid) return res.status(200).json({ ignored: event.type });

  const email = s.customer_details?.email;
  const keys = orderProducts(s.metadata);
  const items = itemsFor(keys);
  if (!email || !items.length) {
    console.error('Pedido sem e-mail ou sem link de entrega', s.id, keys);
    return res.status(200).json({ delivered: false });   // 200 evita reenvio infinito; o reenvio manual cobre
  }
  try {
    const prices = await paidPrices(s, items.map((i) => i.key));
    const t = s.total_details || {};
    // unique_id = id da sessão: se o Stripe reenviar o webhook, o Klaviyo não duplica o pedido nem o e-mail
    await trackEvent({
      email, metric: METRICS.order, value: (s.amount_total || 0) / 100, uniqueId: s.id,
      properties: {
        OrderId: s.id, Source: s.metadata?.source || 'direct',
        // dados do resumo do pedido no e-mail
        FirstName: String(s.customer_details?.name || '').trim().split(/\s+/)[0].slice(0, 40),
        OrderNumber: `VSP-${s.id.slice(-8).toUpperCase()}`,
        OrderDate: new Date((s.created || Date.now() / 1000) * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
        Subtotal: money(s.amount_subtotal), Discount: t.amount_discount ? money(t.amount_discount) : '',
        Tax: t.amount_tax ? money(t.amount_tax) : '', Total: money(s.amount_total || 0),
        ItemNames: items.map((i) => i.name),
        Items: items.map((i) => ({ ...productCard(i.key), DownloadLink: i.link, Price: money(prices[i.key]) })),
        Recommendations: recommendations(keys, { upgradeFrom: s.id, paidCents: s.amount_total || 0 }),
      },
      profile: { Customer: true },
    });
    return res.status(200).json({ delivered: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ delivered: false });   // 500 faz o Stripe tentar de novo
  }
}
