/* Carrinho VESPRO: coleções guardadas no navegador (localStorage), gaveta lateral e checkout por POST em /api/checkout.
 *   [data-add-to-cart="ocean"]  adiciona e abre o carrinho        [data-cart-open]  abre o carrinho
 *   ?cart=ocean,cities na URL   recupera o carrinho (link do e-mail de carrinho abandonado)
 * Ofertas (o servidor recalcula tudo em quote(); aqui é só para mostrar o mesmo número):
 *   combo   3+ coleções no carrinho com desconto em cada
 *   upgrade VESPRO™ Editions com qualquer coleção junto sai a preço de carrinho e substitui as coleções
 *   bump    ao clicar em "Buy" de uma coleção, oferece o Editions a preço de carrinho antes de ir para o Stripe
 * Eventos: AddToCart e InitiateCheckout (pixel), BumpShown/BumpAccepted/BumpDeclined (pixel e Clarity). */
(function () {
  var root = document.querySelector('[data-cart]'); if (!root) return;
  var CAT, OFF;
  try { CAT = JSON.parse(root.getAttribute('data-catalog')); OFF = JSON.parse(root.getAttribute('data-offers')); } catch (e) { return; }
  var KEY = 'vespro_cart';
  var PACKS = Object.keys(CAT).filter(function (k) { return CAT[k].kind === 'pack'; });
  var COMPLETE = CAT.complete;
  var CHEAPEST = Math.min.apply(null, PACKS.map(function (k) { return CAT[k].price; }));
  var CART_PRICE = Math.min(OFF.bumpPrice, COMPLETE.price);   // Editions com qualquer coleção junto
  var EDITIONS = 'VESPRO™ ' + COMPLETE.collection;
  // COMPLETE.count é um rótulo ("150+"): o VESPRO™ Editions não mostra número exato, porque cresce a cada edição
  var $ = function (sel) { return root.querySelector(sel); };
  var money = function (c) { return '$' + (c / 100).toFixed(2); };
  var pct = Math.round(OFF.bundleOff * 100) + '%';
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // O carrinho pode ter o Editions junto com coleções: é o upgrade (o Editions substitui as coleções, a preço de carrinho)
  function normalize(list) {
    var out = [];
    (list || []).forEach(function (k) { if (CAT[k] && out.indexOf(k) < 0) out.push(k); });
    return out;
  }
  /** Mesmo cálculo de quote() em api/_lib/products.js */
  function quote(list) {
    var packs = list.filter(function (k) { return CAT[k].kind === 'pack'; });
    if (list.indexOf('complete') >= 0) {
      var bump = packs.length > 0, amt = bump ? CART_PRICE : COMPLETE.price;
      return { offer: bump ? 'bump' : null, total: amt, full: COMPLETE.price, packs: packs,
        lines: [{ key: 'complete', amount: amt, full: COMPLETE.price }] };
    }
    var bundle = packs.length >= OFF.bundleMin;
    var lines = packs.map(function (k) {
      return { key: k, amount: bundle ? Math.round(CAT[k].price * (1 - OFF.bundleOff)) : CAT[k].price, full: CAT[k].price };
    });
    var total = lines.reduce(function (s, l) { return s + l.amount; }, 0);
    var full = lines.reduce(function (s, l) { return s + l.full; }, 0);
    return { offer: bundle ? 'bundle' : null, total: total, full: full, packs: packs, lines: lines };
  }

  var cart = [];
  try { cart = normalize(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) {}
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  var srcNow = function () {
    try { return (JSON.parse(localStorage.getItem('vespro_src') || '{}').last || {}).source || 'direct'; } catch (e) { return 'direct'; }
  };

  function track(fbName, clarityName, params) {
    if (window.fbq) fbq('track', fbName, Object.assign({ currency: 'USD', content_type: 'product' }, params));
    if (window.clarity) clarity('event', clarityName);
  }
  function custom(name, params) {
    if (window.fbq) fbq('trackCustom', name, params || {});
    if (window.clarity) clarity('event', name);
  }

  function priceHTML(l) {
    return l.amount < l.full ? '<s>' + money(l.full) + '</s><em>' + money(l.amount) + '</em>' : money(l.amount);
  }
  function itemHTML(l, q) {
    var p = CAT[l.key], sub;
    if (l.key === 'complete') {
      sub = COMPLETE.count + ' wallpapers · <span class="cart__price">' + priceHTML(l) + '</span>' +
        (q.packs.length ? '<br>Cart price · replaces ' + q.packs.map(function (k) { return esc(CAT[k].collection); }).join(', ') : '');
    } else {
      sub = p.count + ' wallpapers · <span class="cart__price">' + priceHTML(l) + '</span>';
    }
    return '<li class="cart__item"><img src="' + p.thumb + '" alt="" width="400" height="225">' +
      '<div><b>' + esc(p.name) + '</b><small>' + sub + '</small></div>' +
      '<button type="button" class="cart__rm" data-remove="' + l.key + '">Remove</button></li>';
  }
  function addHTML(k) {
    var p = CAT[k];
    return '<button type="button" class="cart__add" data-add="' + k + '"><img src="' + p.thumb + '" alt="" width="400" height="225">' +
      '<i>VESPRO™</i><b>' + esc(p.collection) + '</b><i>' + esc(p.edition) + '</i><small>+ ' + money(p.price) + '</small></button>';
  }

  function render() {
    var q = quote(cart), hasAll = cart.indexOf('complete') >= 0, n = q.packs.length;
    $('[data-cart-list]').innerHTML = q.lines.map(function (l) { return itemHTML(l, q); }).join('');
    $('[data-cart-empty]').hidden = cart.length > 0;
    var more = hasAll ? [] : PACKS.filter(function (k) { return cart.indexOf(k) < 0; }).slice(0, 3);
    $('[data-cart-more]').innerHTML = more.map(addHTML).join('');
    $('[data-cart-more-wrap]').hidden = !more.length;

    // combo: quanto falta para o desconto (ou aviso de que já está valendo)
    var nudge = $('[data-cart-nudge]');
    nudge.hidden = hasAll || !n;
    nudge.classList.toggle('is-on', q.offer === 'bundle');
    if (!nudge.hidden) {
      var left = OFF.bundleMin - n;
      nudge.textContent = q.offer === 'bundle'
        ? 'Bundle unlocked: ' + pct + ' off every collection in your cart.'
        : 'Add ' + left + ' more collection' + (left > 1 ? 's' : '') + ' and save ' + pct + ' on every one.';
    }

    $('[data-cart-foot]').hidden = !cart.length;
    var saveRow = $('[data-cart-save]');
    saveRow.hidden = !(q.full > q.total);
    if (!saveRow.hidden) saveRow.innerHTML = '<span>' + (q.offer === 'bump' ? 'Cart price for ' + EDITIONS : 'Bundle discount') + '</span><b>−' + money(q.full - q.total) + '</b>';
    $('[data-cart-total]').textContent = money(q.total);
    $('[data-cart-go]').textContent = hasAll
      ? 'Check out · ' + money(q.total)
      : 'Check out ' + n + (n > 1 ? ' collections' : ' collection') + ' · ' + money(q.total) + ' →';

    // upgrade para o Editions a preço de carrinho
    var up = $('[data-cart-upsell]');
    up.hidden = hasAll || !n;
    if (!up.hidden) {
      var gap = CART_PRICE - q.total, have = q.packs.reduce(function (s, k) { return s + CAT[k].count; }, 0);
      $('[data-cart-bar]').style.width = Math.min(100, q.total / CART_PRICE * 100) + '%';
      $('[data-cart-hint]').textContent = gap <= 0
        ? 'Your collections cost more than ' + EDITIONS + ' at its cart price. Get all ' + COMPLETE.count + ' wallpapers for ' + money(CART_PRICE) + ' instead.'
        : gap < CHEAPEST
          ? 'For just ' + money(gap) + ' more, get ' + EDITIONS + ': all ' + COMPLETE.count + ' wallpapers instead of these ' + have + '.'
          : 'Upgrade to ' + EDITIONS + ' for just ' + money(gap) + ' more: all ' + COMPLETE.count + ' wallpapers and every new edition.';
      $('[data-cart-all-label]').innerHTML = 'Upgrade to all ' + COMPLETE.count + ' for <s>' + money(COMPLETE.price) + '</s>' + money(CART_PRICE) + ' →';
      $('[data-cart-all-sub]').textContent = EDITIONS + ' · cart-only price · replaces the collections above';
    }
    document.querySelectorAll('[data-cart-count]').forEach(function (b) { b.textContent = cart.length; b.hidden = !cart.length; });
  }

  var lastFocus = null, closeT;
  function open() {
    clearTimeout(closeT);
    lastFocus = document.activeElement;
    root.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    void root.offsetWidth;   // aplica o estado fechado antes de animar a abertura
    root.classList.add('is-open');
    $('.cart__panel').focus();
  }
  function close() {
    root.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    closeT = setTimeout(function () { root.hidden = true; }, 260);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function note(msg) { var el = $('[data-cart-note]'); el.textContent = msg || ''; el.hidden = !msg; }

  function add(k) {
    if (!CAT[k]) return;
    note('');
    var hasAll = cart.indexOf('complete') >= 0;
    if (hasAll && k !== 'complete') { note(CAT[k].name + ' is already included in ' + EDITIONS + '.'); render(); return; }
    if (cart.indexOf(k) >= 0) { render(); return; }
    var hadPacks = cart.length > 0;
    cart = normalize(cart.concat(k)); save(); render();
    if (k === 'complete' && hadPacks) note(EDITIONS + ' includes every collection, so you pay the cart price: ' + money(CART_PRICE) + '.');
    var q = quote(cart);
    track('AddToCart', 'AddToCart', { value: q.total / 100, content_ids: [k], content_name: CAT[k].name });
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-add-to-cart],[data-cart-open],[data-cart-close],[data-remove],[data-add],[data-cart-all]');
    if (!el) return;
    if (el.hasAttribute('data-add-to-cart')) { e.preventDefault(); add(el.getAttribute('data-add-to-cart')); open(); }
    else if (el.hasAttribute('data-cart-open')) { e.preventDefault(); note(''); render(); open(); }
    else if (el.hasAttribute('data-cart-close')) close();
    else if (el.hasAttribute('data-remove')) { var k = el.getAttribute('data-remove'); cart = cart.filter(function (x) { return x !== k; }); note(''); save(); render(); }
    else if (el.hasAttribute('data-add')) add(el.getAttribute('data-add'));
    else if (el.hasAttribute('data-cart-all')) { custom('BumpAccepted', { where: 'cart', value: CART_PRICE / 100 }); add('complete'); }
  });
  document.addEventListener('keydown', function (e) {
    if (root.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {   // mantém o foco dentro do carrinho
      var f = [].filter.call(root.querySelectorAll('button,input,a[href]'), function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  var form = $('[data-cart-form]');
  function submit() {
    var items = normalize(cart); if (!items.length) return;
    var q = quote(items);
    form.elements.items.value = items.join(',');
    form.elements.src.value = srcNow();
    form.elements.back.value = location.pathname.replace(/^\//, '');
    track('InitiateCheckout', 'ReachCheckout', { value: q.total / 100, num_items: q.lines.length, content_ids: q.lines.map(function (l) { return l.key; }) });
    if (window.vtrack) window.vtrack('ReachCheckout', { content_name: items.join(','), value: q.total / 100, currency: 'USD', offer: q.offer || 'none' });
    var go = $('[data-cart-go]'); go.disabled = true; go.textContent = 'Opening secure checkout…';
    form.submit();
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
  // ao voltar do Stripe pelo botão "voltar", a página pode vir do cache com o botão travado
  window.addEventListener('pageshow', function () { $('[data-cart-go]').disabled = false; render(); });

  window.addEventListener('vespro-cart-clear', function () { cart = []; save(); render(); });

  // ---- Order bump do botão "Buy" de uma coleção (uma vez por visita: quem recusa não vê de novo) ----
  var bump = document.querySelector('[data-bump]'), BUMP_KEY = 'vespro_bump_declined';
  var declined = function () { try { return sessionStorage.getItem(BUMP_KEY) === '1'; } catch (e) { return false; } };
  var bumpFrom = null;
  function closeBump() { bump.hidden = true; document.documentElement.style.overflow = ''; if (bumpFrom && bumpFrom.focus) bumpFrom.focus(); }
  function go(href, extra) {
    var sep = href.indexOf('?') >= 0 ? '&' : '?';
    location.href = href + (/[?&]src=/.test(href) ? '' : sep + 'src=' + encodeURIComponent(srcNow())) + (extra || '');
  }
  if (bump) {
    window.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-checkout]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      var href = a.getAttribute('href') || '', m = href.match(/[?&]product=([a-z-]+)/), k = m && m[1];
      if (!k || !CAT[k] || CAT[k].kind !== 'pack' || declined()) return;
      e.preventDefault(); e.stopPropagation();
      var p = CAT[k], back = (href.match(/[?&]back=([^&]*)/) || [])[1] || '';
      // o clique não chega ao track.js (paramos aqui), então o ClickBuy é registrado agora
      if (window.vtrack) window.vtrack('ClickBuy', { content_name: p.name, value: p.price / 100, currency: 'USD' });
      bumpFrom = a;
      bump.querySelector('[data-bump-extra]').textContent = money(CART_PRICE - p.price);
      bump.querySelector('[data-bump-text]').textContent = 'Upgrade from ' + p.name.replace(/ /g, ' ') + ' to ' + EDITIONS +
        ' for ' + money(CART_PRICE) + ' instead of ' + money(COMPLETE.price) + '. This price is only available right now, with your order.';
      var yes = bump.querySelector('[data-bump-yes]'), no = bump.querySelector('[data-bump-no]');
      yes.textContent = 'Yes, upgrade to everything for ' + money(CART_PRICE);
      yes.setAttribute('href', '/api/checkout?items=' + k + ',complete&back=' + back);
      no.textContent = 'No thanks, just ' + p.collection + ' for ' + money(p.price);
      no.setAttribute('href', href);
      bump.hidden = false; document.documentElement.style.overflow = 'hidden';
      bump.querySelector('.bump__box').focus();
      custom('BumpShown', { from: k });
    }, true);
    bump.addEventListener('click', function (e) {
      var t = e.target.closest('[data-bump-yes],[data-bump-no],[data-bump-close]'); if (!t) return;
      e.preventDefault();
      if (t.hasAttribute('data-bump-close')) return closeBump();
      var href = t.getAttribute('href');
      if (t.hasAttribute('data-bump-yes')) {
        custom('BumpAccepted', { where: 'buy', value: CART_PRICE / 100 });
        track('InitiateCheckout', 'ReachCheckout', { value: CART_PRICE / 100, num_items: 1, content_ids: ['complete'] });
      } else {
        try { sessionStorage.setItem(BUMP_KEY, '1'); } catch (err) {}
        custom('BumpDeclined', {});
        var k2 = (href.match(/[?&]product=([a-z-]+)/) || [])[1];
        track('InitiateCheckout', 'ReachCheckout', { value: (CAT[k2] ? CAT[k2].price : 0) / 100, num_items: 1, content_ids: [k2] });
      }
      t.textContent = 'Opening secure checkout…';
      go(href);
    });
    document.addEventListener('keydown', function (e) { if (!bump.hidden && e.key === 'Escape') closeBump(); });
  }

  // Recupera o carrinho do link do e-mail (?cart=ocean,cities)
  var q = new URLSearchParams(location.search), fromLink = q.get('cart');
  if (fromLink) {
    cart = normalize(fromLink.split(',')); save();
    q.delete('cart');
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
    render(); if (cart.length) open();
  } else render();
})();
