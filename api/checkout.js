// /api/checkout → cria a sessão de checkout no Stripe e redireciona.
//   GET  ?product=ocean&src=google&back=wallpapers/ocean          (botão "Buy" de uma coleção)
//   GET  ?items=signature,complete&src=…&back=…                    (order bump aceito: Editions a preço de carrinho)
//   POST items=ocean,cities&email=…&consent=1&src=…&back=…         (carrinho; 3+ coleções têm desconto de combo)
//   GET  ?upgrade=cs_…&back=thank-you                              (upgrade pós-compra: o que já foi pago conta)
// O preço final vem sempre de quote()/upgradePrice() em _lib/products.js, nunca do navegador.
// Os produtos vão nos metadados (o webhook usa para entregar); a origem da visita vai para atribuição.
// Com e-mail e consentimento, registra "Started Checkout" no Klaviyo (fluxo de carrinho abandonado).
import { stripe } from './_lib/stripe.js';
import { PRODUCTS, CURRENCY, quote, upgradePrice, orderProducts } from './_lib/products.js';
import { trackEvent, subscribe, validEmail, METRICS } from './_lib/klaviyo.js';

const SITE = process.env.SITE_URL || 'https://www.vesprowallpapers.com';
const clean = (s, n = 60) => String(s || '').replace(/[^a-z0-9_.-]/gi, '').slice(0, n);

function params(req, url) {
  if (req.method !== 'POST') return Object.fromEntries(url.searchParams);
  const b = req.body;
  if (typeof b === 'string') return Object.fromEntries(new URLSearchParams(b));
  return b || {};
}

/** Upgrade pós-compra: confere o pedido original no Stripe e monta o carrinho com o crédito. */
async function upgradeQuote(id) {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) return null;
  const s = await stripe('GET', `/checkout/sessions/${id}`);
  if (s.payment_status !== 'paid' || orderProducts(s.metadata).includes('complete')) return null;
  const amount = upgradePrice(s.amount_total || 0);
  return { keys: ['complete'], offer: 'upgrade', total: amount, email: s.customer_details?.email || '', from: s.id,
    lines: [{ key: 'complete', name: `${PRODUCTS.complete.name} (upgrade)`, amount, note: 'What you already paid counts toward this upgrade' }] };
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();
  const url = new URL(req.url, SITE);
  const q = params(req, url);
  let cart;
  try {
    cart = q.upgrade ? await upgradeQuote(String(q.upgrade)) : quote(q.items || q.product);
  } catch (e) {
    console.error(e);
    return res.status(502).send('Checkout is temporarily unavailable. Please try again in a minute.');
  }
  if (!cart || !cart.keys.length) return res.status(q.upgrade ? 400 : 404).send(q.upgrade ? 'This upgrade is not available.' : 'Unknown product');
  const source = clean(q.src);
  const email = String(q.email || cart.email || '').trim().toLowerCase();
  const hasEmail = validEmail(email);
  // página de volta se cancelar: só caminhos internos simples (letras, números, hífen e barra)
  const back = '/' + String(q.back || '').replace(/[^a-z0-9/-]/gi, '').replace(/^\/+/, '').slice(0, 120);
  const meta = { products: cart.keys.join(','), source: source || 'direct', offer: cart.offer || undefined, upgrade_from: cart.from };
  try {
    const session = await stripe('POST', '/checkout/sessions', {
      mode: 'payment',
      line_items: cart.lines.map((l) => ({ quantity: 1, price_data: { currency: CURRENCY, unit_amount: l.amount,
        product_data: { name: l.name, description: l.note || PRODUCTS[l.key].blurb || `${l.name}, oil painting wallpapers` } } })),
      success_url: `${SITE}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE}${back === '/' ? '/wallpapers' : back}`,
      customer_email: hasEmail ? email : undefined,
      customer_creation: 'if_required',
      allow_promotion_codes: 'true',
      automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === 'true' ? 'true' : 'false' },
      client_reference_id: source || undefined,
      metadata: meta,
      payment_intent_data: { metadata: { products: meta.products, offer: meta.offer } },
    });
    if (hasEmail && (q.consent === '1' || q.consent === 'on' || q.consent === true)) {
      // carrinho abandonado: só para quem autorizou receber e-mails
      await Promise.all([
        subscribe({ email, source: 'Cart' }),
        trackEvent({ email, metric: METRICS.checkout, value: cart.total / 100, uniqueId: session.id, properties: {
          CheckoutId: session.id, CartURL: `${SITE}/wallpapers?cart=${cart.keys.join(',')}`,
          ItemNames: cart.lines.map((l) => l.name),
          Items: cart.lines.map((l) => ({ ProductID: l.key, ProductName: l.name, Price: l.amount / 100 })),
          Offer: cart.offer || 'none', Source: source || 'direct',
        } }),
      ]).catch((e) => console.error(e));
    }
    res.setHeader('Cache-Control', 'no-store');
    res.writeHead(303, { Location: session.url });
    res.end();
  } catch (e) {
    console.error(e);
    res.status(502).send('Checkout is temporarily unavailable. Please try again in a minute.');
  }
}
