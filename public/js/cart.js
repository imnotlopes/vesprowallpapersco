/* Carrinho VESPRO: coleções guardadas no navegador (localStorage), gaveta lateral e checkout por POST em /api/checkout.
 *   [data-add-to-cart="ocean"]  adiciona e abre o carrinho (aceita várias: "ocean,complete")        [data-cart-open]  abre o carrinho
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

  var TRASH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';
  var LOCK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">' +
    '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  function priceHTML(l) {
    return l.amount < l.full ? '<s>' + money(l.full) + '</s><em>' + money(l.amount) + '</em>' : money(l.amount);
  }
  function itemHTML(l, q) {
    var p = CAT[l.key], upgraded = l.key === 'complete' && q.packs.length > 0;
    // no upgrade, desfazer é pela caixinha (as coleções voltam), então o Editions não leva lixeira
    var rm = upgraded ? '' : '<button type="button" class="cart__rm" data-remove="' + l.key + '" aria-label="Remove ' + esc(p.name) + '">' + TRASH + '</button>';
    return '<li class="cart__item"><img src="' + p.thumb + '" alt="" width="400" height="225">' +
      '<div><b>' + esc(p.name) + '</b><small>' + p.count + ' wallpapers</small></div>' +
      '<div class="cart__side"><span class="cart__price">' + priceHTML(l) + '</span>' + rm + '</div></li>';
  }
  function cardHTML(k) {
    var p = CAT[k];
    return '<img src="' + p.thumb + '" alt="" width="400" height="225">' +
      '<div><b>' + esc(p.collection) + '</b><small>' + p.count + ' wallpapers · ' + money(p.price) + '</small></div>' +
      '<button type="button" class="cart__addbtn" data-add="' + k + '" aria-label="Add ' + esc(p.name) + '">Add</button>';
  }

  var moreI = 0;
  function render() {
    var q = quote(cart), hasAll = cart.indexOf('complete') >= 0, n = q.packs.length;
    $('[data-cart-n]').textContent = q.lines.length ? '(' + q.lines.length + ')' : '';
    $('[data-cart-list]').innerHTML = q.lines.map(function (l) { return itemHTML(l, q); }).join('');
    $('[data-cart-empty]').hidden = cart.length > 0;

    // combo: barra de progresso no topo (quanto falta para o desconto, ou aviso de que já está valendo)
    var goal = $('[data-cart-goal]');
    goal.hidden = hasAll || !n;
    if (!goal.hidden) {
      var left = OFF.bundleMin - n;
      goal.classList.toggle('is-on', left <= 0);
      $('[data-cart-goal-text]').innerHTML = left <= 0
        ? '<b>Bundle unlocked:</b> ' + pct + ' off every collection.'
        : 'Add <b>' + left + ' more collection' + (left > 1 ? 's' : '') + '</b> and save ' + pct + ' on each.';
      $('[data-cart-bar]').style.width = Math.min(100, n / OFF.bundleMin * 100) + '%';
    }

    // upgrade para o Editions a preço de carrinho: caixinha marcada = Editions no carrinho, substituindo as coleções
    var up = $('[data-cart-up]');
    up.hidden = !n;
    if (!up.hidden) {
      var gap = CART_PRICE - q.total;
      $('[data-cart-up-box]').checked = hasAll;
      $('[data-cart-up-sub]').textContent = hasAll
        ? 'Replaces your collections · every new edition included'
        : gap <= 0 ? 'Costs less than your cart · every new edition included'
          : 'Just ' + money(gap) + ' more · every new edition included';
      $('[data-cart-up-price]').innerHTML = '<s>' + money(COMPLETE.price) + '</s>' + money(CART_PRICE);
    }

    // carrossel com as coleções que ainda não estão no carrinho, uma por vez
    var more = hasAll ? [] : PACKS.filter(function (k) { return cart.indexOf(k) < 0; });
    $('[data-cart-more-wrap]').hidden = !more.length;
    if (more.length) {
      moreI = ((moreI % more.length) + more.length) % more.length;
      $('[data-cart-more]').innerHTML = cardHTML(more[moreI]);
      $('[data-cart-slide]').classList.toggle('is-one', more.length < 2);
    }

    $('[data-cart-foot]').hidden = !cart.length;
    $('[data-cart-rows]').innerHTML = q.full > q.total
      ? '<div><span>Subtotal</span><span>' + money(q.full) + '</span></div>' +
        '<div class="is-save"><span>' + (q.offer === 'bump' ? 'Cart price' : 'Bundle discount') + '</span><span>−' + money(q.full - q.total) + '</span></div>'
      : '';
    $('[data-cart-total]').textContent = money(q.total);
    $('[data-cart-go]').innerHTML = LOCK + ' Checkout · ' + money(q.total);
    document.querySelectorAll('[data-cart-count]').forEach(function (b) { b.textContent = q.lines.length; b.hidden = !q.lines.length; });
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
    cart = normalize(cart.concat(k)); save(); render();   // com coleções junto, a caixinha de upgrade aparece marcada
    var q = quote(cart);
    track('AddToCart', 'AddToCart', { value: q.total / 100, content_ids: [k], content_name: CAT[k].name });
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-add-to-cart],[data-cart-open],[data-cart-close],[data-remove],[data-add],[data-more]');
    if (!el) return;
    if (el.hasAttribute('data-add-to-cart')) { e.preventDefault(); el.getAttribute('data-add-to-cart').split(',').forEach(add); open(); }
    else if (el.hasAttribute('data-cart-open')) { e.preventDefault(); note(''); render(); open(); }
    else if (el.hasAttribute('data-cart-close')) close();
    else if (el.hasAttribute('data-remove')) { var k = el.getAttribute('data-remove'); cart = cart.filter(function (x) { return x !== k; }); note(''); save(); render(); }
    else if (el.hasAttribute('data-add')) add(el.getAttribute('data-add'));
    else if (el.hasAttribute('data-more')) { moreI += +el.getAttribute('data-more'); render(); }
  });
  // caixinha de upgrade: marcar põe o Editions (a preço de carrinho); desmarcar tira e as coleções voltam
  $('[data-cart-up-box]').addEventListener('change', function (e) {
    note('');
    if (e.target.checked) { custom('BumpAccepted', { where: 'cart', value: CART_PRICE / 100 }); add('complete'); }
    else { cart = cart.filter(function (x) { return x !== 'complete'; }); save(); render(); }
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
      if (!a || a.hasAttribute('data-no-bump') || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
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
