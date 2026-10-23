// POST /api/stripe-webhook — evento checkout.session.completed (pago) → evento "Placed Order" no Klaviyo
// com os links de download (o fluxo do Klaviyo manda o e-mail). Assinatura validada com STRIPE_WEBHOOK_SECRET.
import { verifyWebhook, readRaw } from './_lib/stripe.js';
import { itemsFor } from './_lib/links.js';
import { orderProducts } from './_lib/products.js';
import { trackEvent, METRICS } from './_lib/klaviyo.js';

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
    // unique_id = id da sessão: se o Stripe reenviar o webhook, o Klaviyo não duplica o pedido nem o e-mail
    await trackEvent({
      email, metric: METRICS.order, value: (s.amount_total || 0) / 100, uniqueId: s.id,
      properties: {
        OrderId: s.id, Source: s.metadata?.source || 'direct',
        ItemNames: items.map((i) => i.name),
        Items: items.map((i) => ({ ProductID: i.key, ProductName: i.name, DownloadLink: i.link })),
      },
      profile: { Customer: true },
    });
    return res.status(200).json({ delivered: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ delivered: false });   // 500 faz o Stripe tentar de novo
  }
}
