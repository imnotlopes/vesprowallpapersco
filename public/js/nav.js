/* Topo VESPRO™: menu grande de "Wallpapers" (abre no hover em computador e no clique), menu lateral do celular
 * e busca (baixa /search.json na primeira abertura). Esc fecha qualquer um; o foco volta para quem abriu. */
(function () {
  var hover = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var lockScroll = function (on) { document.documentElement.style.overflow = on ? 'hidden' : ''; };

  // Menu grande
  var mega = document.querySelector('[data-mega]'), tgl = document.querySelector('[data-mega-toggle]');
  if (mega && tgl) {
    var li = tgl.parentElement, t;
    var setMega = function (open) { mega.hidden = !open; tgl.setAttribute('aria-expanded', open ? 'true' : 'false'); };
    tgl.addEventListener('click', function () { setMega(mega.hidden); });
    if (hover) {
      [li, mega].forEach(function (el) {
        el.addEventListener('mouseenter', function () { clearTimeout(t); setMega(true); });
        el.addEventListener('mouseleave', function () { t = setTimeout(function () { setMega(false); }, 160); });
      });
    }
    document.addEventListener('click', function (e) { if (!mega.hidden && !li.contains(e.target) && !mega.contains(e.target)) setMega(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mega.hidden) { setMega(false); tgl.focus(); } });
  }

  // Painéis que abrem por cima da página (menu do celular e busca)
  function panel(root, openSel, closeSel, onOpen) {
    if (!root) return null;
    var last = null;
    var open = function (from) {
      last = from || document.activeElement;
      root.hidden = false; lockScroll(true);
      void root.offsetWidth;   // aplica o estado fechado antes de animar
      root.classList.add('is-open');
      if (from && from.hasAttribute('aria-expanded')) from.setAttribute('aria-expanded', 'true');
      if (onOpen) onOpen();
    };
    var close = function () {
      if (root.hidden) return;
      root.classList.remove('is-open'); lockScroll(false);
      document.querySelectorAll(openSel + '[aria-expanded]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      setTimeout(function () { root.hidden = true; }, 220);
      if (last && last.focus) last.focus();
    };
    document.addEventListener('click', function (e) {
      var o = e.target.closest && e.target.closest(openSel);
      if (o) { e.preventDefault(); open(o); return; }
      if (!root.hidden && e.target.closest && e.target.closest(closeSel)) close();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    return { open: open, close: close };
  }

  var mnav = document.querySelector('[data-mnav]');
  panel(mnav, '[data-mnav-open]', '[data-mnav-close], [data-mnav] a', function () { mnav.querySelector('.mnav__panel').focus(); });

  // Busca
  var srch = document.querySelector('[data-search]');
  if (!srch) return;
  var input = srch.querySelector('[data-search-input]'), out = srch.querySelector('[data-search-results]');
  var index = null, loading = null;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function load() {
    if (index || loading) return loading;
    loading = fetch('/search.json').then(function (r) { return r.json(); }).then(function (d) {
      index = d.map(function (x) { x.s = (x.t + ' ' + x.k + ' ' + x.q).toLowerCase(); return x; });
      render();
    }).catch(function () { out.innerHTML = '<p>Search is unavailable right now.</p>'; });
    return loading;
  }
  function render() {
    if (!index) { out.innerHTML = '<p>Loading…</p>'; return; }
    var q = input.value.trim().toLowerCase(), words = q.split(/\s+/).filter(Boolean);
    var hits = words.length
      ? index.filter(function (x) { return words.every(function (w) { return x.s.indexOf(w) >= 0; }); }).slice(0, 12)
      : index.filter(function (x) { return x.k === 'Collection'; });
    var head = words.length ? (hits.length ? '' : '<p>No results for “' + esc(input.value.trim()) + '”. Try ocean, cars, winter or MacBook.</p>') : '<p>Popular collections</p>';
    out.innerHTML = head + hits.map(function (x) {
      return '<a class="srch__item" href="' + x.u + '">' + (x.i ? '<img src="' + x.i + '" alt="" width="400" height="225">' : '<span class="srch__ph"></span>') +
        '<span><b>' + esc(x.t) + '</b><small>' + esc(x.k) + '</small></span></a>';
    }).join('');
  }
  var sp = panel(srch, '[data-search-open]', '[data-search-close]', function () { input.focus(); load(); render(); });
  input.addEventListener('input', render);
  var report = function () {
    var q = input.value.trim(); if (!q) return;
    if (window.fbq) fbq('track', 'Search', { search_string: q });
    if (window.clarity) clarity('event', 'Search');
  };
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { var first = out.querySelector('a'); if (first) { report(); location.href = first.getAttribute('href'); } }
    if (e.key === 'ArrowDown') { var a = out.querySelector('a'); if (a) { e.preventDefault(); a.focus(); } }
  });
  out.addEventListener('click', function (e) { if (e.target.closest('a')) report(); });
})();
