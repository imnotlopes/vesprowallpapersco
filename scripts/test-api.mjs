// Testes das funções da Vercel com Stripe e Klaviyo simulados (node scripts/test-api.mjs).
import crypto from 'node:crypto';
import { Readable } from 'node:stream';
process.env.STRIPE_SECRET_KEY = 'sk_test_x'; process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
process.env.KLAVIYO_PRIVATE_KEY = 'pk_test'; process.env.KLAVIYO_LIST_ID = 'LIST1';
process.env.DELIVERY_LINKS = JSON.stringify({ free: 'https://drive/free', complete: 'https://drive/complete', ocean: 'https://drive/ocean', cities: 'https://drive/cities' });

const calls = [];
globalThis.fetch = async (url, opt = {}) => {
  calls.push({ url: String(url), method: opt.method || 'GET', body: opt.body, headers: opt.headers || {} });
  const u = String(url);
  const json = (o, status = 200) => ({ ok: status < 400, status, json: async () => o, text: async () => JSON.stringify(o) });
  if (u.includes('/checkout/sessions/search')) return json({ data: [
    { payment_status: 'paid', metadata: { product: 'ocean' } },
    { payment_status: 'paid', metadata: { products: 'cities' } },
    { payment_status: 'unpaid', metadata: { products: 'complete' } }] });
  if (u.endsWith('/checkout/sessions')) return json({ url: 'https://checkout.stripe.com/c/pay/cs_test_123', id: 'cs_test_123' });
  if (u.includes('/checkout/sessions/cs_test_123')) return json({ id: 'cs_test_123', payment_status: 'paid', amount_total: 1499, currency: 'usd', metadata: { products: 'complete', source: 'google' } });
  if (u.includes('/checkout/sessions/cs_test_789')) return json({ id: 'cs_test_789', payment_status: 'paid', amount_total: 799, currency: 'usd', customer_details: { email: 'buyer@example.com' }, metadata: { products: 'signature' } });
  if (u.includes('/checkout/sessions/cs_test_full')) return json({ id: 'cs_test_full', payment_status: 'paid', amount_total: 1999, currency: 'usd', metadata: { products: 'complete' } });
  if (u.includes('/checkout/sessions/cs_test_456')) return json({ id: 'cs_test_456', payment_status: 'unpaid', amount_total: 598, currency: 'usd', metadata: { products: 'ocean,cities' } });
  if (u.includes('a.klaviyo.com')) return { ok: true, status: 202, json: async () => null, text: async () => '' };
  return json({ error: { message: 'unmocked ' + u } }, 500);
};
function mkRes() { const r = { code: 200, headers: {}, body: null,
  status(c) { this.code = c; return this; }, send(b) { this.body = b; return this; }, json(b) { this.body = b; return this; },
  setHeader(k, v) { this.headers[k] = v; }, writeHead(c, h) { this.code = c; Object.assign(this.headers, h); }, end() {} }; return r; }
const ok = (cond, msg) => { console.log((cond ? 'OK   ' : 'FALHA') + ' ' + msg); if (!cond) process.exitCode = 1; };
const kEvents = () => calls.filter((c) => c.url.endsWith('/api/events')).map((c) => JSON.parse(c.body).data.attributes);
const kSubs = () => calls.filter((c) => c.url.includes('profile-subscription-bulk-create-jobs')).map((c) => JSON.parse(c.body).data);
const checkout = (await import('../api/checkout.js')).default;

// checkout: um pack pelo botão "Buy"
let res = mkRes(); calls.length = 0;
await checkout({ url: '/api/checkout?product=ocean&src=google&back=wallpapers/ocean', method: 'GET' }, res);
let body = new URLSearchParams(calls[0].body);
ok(res.code === 303 && res.headers.Location.startsWith('https://checkout.stripe.com'), 'checkout redireciona para o Stripe');
ok(body.get('line_items[0][price_data][unit_amount]') === '249' && body.get('metadata[products]') === 'ocean' && body.get('metadata[source]') === 'google', 'checkout envia preço, produto e origem');
ok(body.get('cancel_url') === 'https://www.vesprowallpapers.com/wallpapers/ocean', 'checkout volta para a página de origem se cancelar');
ok(!kEvents().length, 'sem e-mail, nada vai para o Klaviyo');
res = mkRes(); await checkout({ url: '/api/checkout?product=hack', method: 'GET' }, res);
ok(res.code === 404, 'produto inexistente é recusado');

// checkout: carrinho com vários packs, e-mail e consentimento
res = mkRes(); calls.length = 0;
await checkout({ url: '/api/checkout', method: 'POST', body: { items: 'ocean,cities,ocean,hack', email: 'Cart@Example.com', consent: '1', src: 'pinterest', back: 'wallpapers' } }, res);
body = new URLSearchParams(calls[0].body);
ok(res.code === 303 && body.get('line_items[1][price_data][unit_amount]') === '249' && !body.has('line_items[2][quantity]'), 'carrinho vira 2 itens no Stripe (repetido e inválido saem)');
ok(body.get('metadata[products]') === 'ocean,cities' && body.get('customer_email') === 'cart@example.com', 'carrinho leva os produtos e já preenche o e-mail');
let ev = kEvents()[0];
ok(ev && ev.metric.data.attributes.name === 'Started Checkout' && ev.value === 4.98 && ev.properties.CartURL.endsWith('?cart=ocean,cities') && ev.unique_id === 'cs_test_123', 'com consentimento, registra Started Checkout com link do carrinho');
ok(kSubs().length === 1 && kSubs()[0].relationships.list.data.id === 'LIST1', 'com consentimento, inscreve na lista de novidades');
ok(calls.find((c) => c.url.includes('klaviyo')).headers.revision === '2026-10-15', 'Klaviyo recebe o cabeçalho de versão da API');
res = mkRes(); calls.length = 0;
await checkout({ url: '/api/checkout', method: 'POST', body: 'items=ocean%2Ccities&email=cart%40example.com&src=google' }, res);
ok(res.code === 303 && !kEvents().length && !kSubs().length, 'sem consentimento: checkout normal, sem e-mail de carrinho abandonado');
res = mkRes(); calls.length = 0;
await checkout({ url: '/api/checkout', method: 'POST', body: { items: 'ocean,complete,cities' } }, res);
body = new URLSearchParams(calls[0].body);
ok(body.get('metadata[products]') === 'complete' && body.get('line_items[0][price_data][unit_amount]') === '1499' && !body.has('line_items[1][quantity]') && body.get('metadata[offer]') === 'bump', 'Editions com coleções no carrinho: substitui as coleções e sai a preço de carrinho ($14.99)');

// ofertas: Editions sozinho, order bump do "Buy", combo de 3+ coleções e upgrade pós-compra
const line = (b, i) => b.get(`line_items[${i}][price_data][unit_amount]`);
res = mkRes(); calls.length = 0; await checkout({ url: '/api/checkout?product=complete', method: 'GET' }, res);
body = new URLSearchParams(calls[0].body);
ok(line(body, 0) === '1999' && !body.has('metadata[offer]'), 'Editions comprado sozinho custa o preço cheio ($19.99)');
res = mkRes(); calls.length = 0; await checkout({ url: '/api/checkout?items=signature,complete&src=google&back=collections/signature', method: 'GET' }, res);
body = new URLSearchParams(calls[0].body);
ok(res.code === 303 && line(body, 0) === '1499' && body.get('metadata[products]') === 'complete' && body.get('metadata[offer]') === 'bump', 'order bump aceito: Editions a $14.99 no lugar da coleção');
res = mkRes(); calls.length = 0; await checkout({ url: '/api/checkout', method: 'POST', body: { items: 'ocean,signature' } }, res);
body = new URLSearchParams(calls[0].body);
ok(line(body, 0) === '249' && line(body, 1) === '799' && !body.has('metadata[offer]'), 'duas coleções: sem desconto de combo');
res = mkRes(); calls.length = 0; await checkout({ url: '/api/checkout', method: 'POST', body: { items: 'ocean,signature,shadows' } }, res);
body = new URLSearchParams(calls[0].body);
ok(line(body, 0) === '199' && line(body, 1) === '639' && line(body, 2) === '399' && body.get('metadata[offer]') === 'bundle', 'três coleções: 20% de desconto em cada');
res = mkRes(); calls.length = 0; await checkout({ url: '/api/checkout?upgrade=cs_test_789&back=thank-you', method: 'GET' }, res);
body = new URLSearchParams(calls.find((c) => c.method === 'POST').body);
ok(res.code === 303 && line(body, 0) === '1200' && body.get('metadata[upgrade_from]') === 'cs_test_789' && body.get('customer_email') === 'buyer@example.com', 'upgrade pós-compra: $19.99 menos os $7.99 pagos, com o e-mail já preenchido');
res = mkRes(); calls.length = 0; await checkout({ url: '/api/checkout?upgrade=cs_test_456', method: 'GET' }, res);
ok(res.code === 400 && !calls.some((c) => c.method === 'POST'), 'upgrade de pedido não pago é recusado');
res = mkRes(); calls.length = 0; await checkout({ url: '/api/checkout?upgrade=cs_test_full', method: 'GET' }, res);
ok(res.code === 400 && !calls.some((c) => c.method === 'POST'), 'upgrade de quem já tem o Editions é recusado');
res = mkRes(); calls.length = 0; await checkout({ url: '/api/checkout?upgrade=../../x', method: 'GET' }, res);
ok(res.code === 400 && !calls.length, 'upgrade com id inválido é recusado sem consultar o Stripe');

// webhook
const wh = (await import('../api/stripe-webhook.js')).default;
const event = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: 'cs_1', payment_status: 'paid', amount_total: 498, customer_details: { email: 'buyer@example.com' }, metadata: { products: 'ocean,cities', source: 'google' } } } });
const t = Math.floor(Date.now() / 1000), sig = crypto.createHmac('sha256', 'whsec_test').update(`${t}.${event}`).digest('hex');
const req = (h) => Object.assign(Readable.from([Buffer.from(event)]), { method: 'POST', headers: h });
res = mkRes(); calls.length = 0; await wh(req({ 'stripe-signature': `t=${t},v1=${sig}` }), res);
ev = kEvents()[0];
ok(res.code === 200 && res.body.delivered === true, 'webhook válido entrega o pedido');
ok(ev && ev.metric.data.attributes.name === 'Placed Order' && ev.profile.data.attributes.email === 'buyer@example.com' && ev.value === 4.98 && ev.unique_id === 'cs_1', 'Placed Order vai para o comprador com valor e id único');
ok(ev.properties.Items.map((i) => i.DownloadLink).join() === 'https://drive/ocean,https://drive/cities', 'Placed Order leva os links certos de cada pack');
res = mkRes(); calls.length = 0; await wh(req({ 'stripe-signature': `t=${t},v1=${'0'.repeat(64)}` }), res);
ok(res.code === 400 && !calls.length, 'assinatura falsa é recusada e nada é enviado');

// pack grátis
const fp = (await import('../api/free-pack.js')).default;
res = mkRes(); calls.length = 0; await fp({ method: 'POST', body: { email: 'Fan@Example.com', marketing: false, device: 'mac' } }, res);
ev = kEvents()[0];
ok(res.body.ok && ev.metric.data.attributes.name === 'Requested Free Pack' && ev.properties.DownloadLink === 'https://drive/free' && ev.profile.data.attributes.email === 'fan@example.com', 'pack grátis registra o evento com o link');
ok(!kSubs().length, 'sem a caixa marcada, não entra na lista de novidades');
res = mkRes(); calls.length = 0; await fp({ method: 'POST', body: { email: 'fan@example.com', marketing: true } }, res);
ok(kSubs().length === 1, 'com a caixa marcada, entra na lista de novidades');
res = mkRes(); calls.length = 0; await fp({ method: 'POST', body: { email: 'bot@example.com', website: 'x' } }, res);
ok(res.body.ok && !calls.length, 'robô (campo escondido preenchido) não dispara envio');
res = mkRes(); await fp({ method: 'POST', body: { email: 'nao-e-email' } }, res);
ok(res.code === 400, 'e-mail inválido é recusado');

// reenvio de links
res = mkRes(); calls.length = 0; await (await import('../api/resend-links.js')).default({ method: 'POST', body: { email: 'buyer@example.com' } }, res);
ev = kEvents()[0];
const links = ev ? ev.properties.Items.map((i) => i.DownloadLink).join() : '';
ok(res.body.ok && ev && ev.metric.data.attributes.name === 'Requested Download Links' && links === 'https://drive/ocean,https://drive/cities', 'reenvio manda só o que foi pago (pedidos antigos e novos)');

// pedido (Purchase + links na página de obrigado)
const order = (await import('../api/order.js')).default;
res = mkRes(); await order({ url: '/api/order?session_id=cs_test_123' }, res);
ok(res.body.ok && res.body.value === 14.99 && res.body.currency === 'USD' && res.body.products[0] === 'complete', 'pedido devolve valor e produto para o Purchase');
ok(res.body.items.length === 1 && res.body.items[0].link === 'https://drive/complete', 'pedido pago mostra o link de download na página de obrigado');
res = mkRes(); await order({ url: '/api/order?session_id=cs_test_456' }, res);
ok(!res.body.ok && res.body.items.length === 0, 'pedido não pago não mostra links');
res = mkRes(); await order({ url: '/api/order?session_id=../../etc' }, res);
ok(res.code === 400, 'id de sessão inválido é recusado');
