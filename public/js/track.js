/* Rastreamento do funil VESPRO (pixel do Meta + Microsoft Clarity).
 *
 * Origem da sessão: grava a primeira e a última origem (utm_source, referrer: google, instagram,
 * pinterest, email…) por 90 dias e envia como tag do Clarity e parâmetro dos eventos.
 *
 * Eventos (todos personalizados no pixel; o Purchase vem do checkout/Stripe na etapa 3):
 *   ViewCatalog     página de catálogo, tema ou aparelho        <body data-page-type="hub|catalog">
 *   ViewCollection  página de coleção paga                      <body data-page-type="collection">
 *   ViewWallpaper   página de uma obra                          <body data-page-type="wallpaper">
 *   ClickBuy        clique em comprar                           data-track="ClickBuy" data-track-value="2.99" data-track-name="…"
 *   ReachCheckout   saída para o checkout (link do Stripe)      automático em links para checkout.stripe.com / buy.stripe.com
 *   FreePackSubmit  envio do formulário do pack grátis          data-track="FreePackSubmit" (no <form>)
 * Qualquer elemento com data-track="NomeDoEvento" dispara o evento no clique (ou no submit, se for form).
 */
(function () {
  var KEY = 'vespro_src', TTL = 90 * 24 * 3600 * 1000;

  function sourceNow() {
    var q = new URLSearchParams(location.search), utm = q.get('utm_source');
    if (utm) return { source: utm.toLowerCase(), medium: (q.get('utm_medium') || '').toLowerCase(), campaign: q.get('utm_campaign') || '' };
    if (q.get('fbclid')) return { source: 'facebook', medium: 'paid', campaign: '' };
    if (q.get('gclid')) return { source: 'google', medium: 'cpc', campaign: '' };
    var r = document.referrer;
    if (!r) return null;
    var h;
    try { h = new URL(r).hostname.replace(/^www\./, ''); } catch (e) { return null; }
    if (h === location.hostname.replace(/^www\./, '')) return null;          // navegação interna
    var map = [[/google\./, 'google', 'organic'], [/bing\./, 'bing', 'organic'], [/duckduckgo\./, 'duckduckgo', 'organic'],
      [/instagram\./, 'instagram', 'social'], [/facebook\.|fb\.com/, 'facebook', 'social'], [/pinterest\./, 'pinterest', 'social'],
      [/t\.co$|twitter\.|x\.com/, 'x', 'social'], [/reddit\./, 'reddit', 'social'], [/tiktok\./, 'tiktok', 'social'],
      [/mail\.|outlook\./, 'email', 'email']];
    for (var i = 0; i < map.length; i++) if (map[i][0].test(h)) return { source: map[i][1], medium: map[i][2], campaign: '' };
    return { source: h, medium: 'referral', campaign: '' };
  }

  var store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  if (store.t && Date.now() - store.t > TTL) store = {};
  var now = sourceNow();
  if (now) { if (!store.first) store.first = now; store.last = now; store.t = Date.now(); }
  if (!store.first) store.first = store.last = { source: 'direct', medium: 'none', campaign: '' };
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}

  var ctx = { source: store.last.source, medium: store.last.medium, first_source: store.first.source, page_type: (window.VESPRO || {}).pageType || '' };

  if (window.clarity) {
    clarity('set', 'source', ctx.source);
    clarity('set', 'first_source', ctx.first_source);
  }

  function track(name, params) {
    var p = Object.assign({}, ctx, params || {});
    if (window.fbq) fbq('trackCustom', name, p);
    if (window.clarity) clarity('event', name);
  }
  window.vtrack = track;

  // Visualização por tipo de página
  var type = document.body.getAttribute('data-page-type');
  var VIEW = { hub: 'ViewCatalog', catalog: 'ViewCatalog', collection: 'ViewCollection', wallpaper: 'ViewWallpaper' };
  if (VIEW[type]) track(VIEW[type], { content_name: document.title });

  // Cliques e formulários marcados com data-track; saída para o checkout do Stripe
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-track],a[href]');
    if (!el) return;
    var name = el.getAttribute('data-track');
    if (name && el.tagName !== 'FORM') {
      var v = parseFloat(el.getAttribute('data-track-value'));
      track(name, { content_name: el.getAttribute('data-track-name') || el.textContent.trim().slice(0, 80), value: isNaN(v) ? undefined : v, currency: isNaN(v) ? undefined : 'USD' });
    }
    var href = el.getAttribute('href') || '';
    if (el.hasAttribute('data-checkout') && href.indexOf('/api/checkout') === 0) {
      // leva a origem da visita para o Stripe (metadados do pedido) e marca a ida ao checkout
      if (!/[?&]src=/.test(href)) el.setAttribute('href', href + '&src=' + encodeURIComponent(ctx.source));
      track('ReachCheckout', { content_name: el.getAttribute('data-track-name') || '' });
    } else if (/^https:\/\/(checkout|buy)\.stripe\.com\//.test(href)) {
      track('ReachCheckout', { content_name: el.getAttribute('data-track-name') || '' });
    }
  }, true);
  document.addEventListener('submit', function (e) {
    var name = e.target.getAttribute && e.target.getAttribute('data-track');
    if (name) track(name, {});
  }, true);
})();
