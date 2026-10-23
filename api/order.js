// GET /api/order?session_id=cs_… → dados do pedido para a página de obrigado: valor para o Purchase
// e os links de download (só se pago), para a entrega não depender do e-mail chegar.
import { stripe } from './_lib/stripe.js';
import { PRODUCTS, orderProducts } from './_lib/products.js';
import { itemsFor } from './_lib/links.js';

export default async function handler(req, res) {
  const id = new URL(req.url, 'http://x').searchParams.get('session_id') || '';
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) return res.status(400).json({ ok: false });
  try {
    const s = await stripe('GET', `/checkout/sessions/${id}`);
    const keys = orderProducts(s.metadata);
    const paid = s.payment_status === 'paid';
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      ok: paid, id: s.id, products: keys, name: keys.map((k) => PRODUCTS[k]?.name || k).join(' + '),
      value: (s.amount_total || 0) / 100, currency: (s.currency || 'usd').toUpperCase(), source: s.metadata?.source || '',
      items: paid ? itemsFor(keys).map((i) => ({ name: i.name, link: i.link })) : [],
    });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false });
  }
}
