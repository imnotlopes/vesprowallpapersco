/* Telas flutuantes nas margens de todas as páginas (como no site BR).
 * Espalha prévias do catálogo pelas laterais do <main>, alternando lados a cada ~560px.
 * Só monta quando sobra margem ao lado do conteúdo; pula áreas marcadas com [data-floaters-skip]
 * (hero da home, que já tem as suas, e carrosséis de largura total). Cada página sorteia
 * artes diferentes, mas sempre as mesmas naquela página. */
(function () {
  var layer = document.querySelector('[data-floaters]'); if (!layer) return;
  var imgs; try { imgs = JSON.parse(layer.getAttribute('data-floaters')); } catch (e) { return; }
  if (!imgs || !imgs.length) return;
  // A partir de 768px. Com margem larga, a tela fica inteira ao lado do conteúdo; com margem estreita,
  // ela aparece pela metade saindo da borda da tela (como no site BR), mais transparente.
  var MIN = 768, STEP = 420, WRAP = 1120;

  // Sorteio estável por página: a mesma URL sempre mostra as mesmas artes
  var seed = 0, p = location.pathname;
  for (var i = 0; i < p.length; i++) seed = (seed * 31 + p.charCodeAt(i)) >>> 0;
  var rnd = function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  var order = imgs.slice();
  for (var j = order.length - 1; j > 0; j--) { var k = Math.floor(rnd() * (j + 1)), t = order[j]; order[j] = order[k]; order[k] = t; }
  var looks = order.map(function () {
    return { w: 160 + Math.round(rnd() * 50), rot: (rnd() < 0.5 ? -1 : 1) * (5 + rnd() * 4), dx: Math.round(rnd() * 30),
      dy: Math.round(rnd() * 140 - 70), op: 0.4 + rnd() * 0.1, dur: 5.8 + rnd() * 1.6, delay: -rnd() * 5 };
  });

  var built = false;
  var build = function () {
    layer.textContent = '';
    built = window.innerWidth >= MIN;
    if (!built) return;
    var top = layer.getBoundingClientRect().top + window.scrollY;
    var skips = [].map.call(document.querySelectorAll('[data-floaters-skip]'), function (el) {
      var r = el.getBoundingClientRect(); return [r.top + window.scrollY - top - 120, r.bottom + window.scrollY - top + 40];
    });
    var H = layer.offsetHeight, y = 140, n = 0, side = 0;
    var vw = layer.clientWidth, wrap = Math.min(WRAP, vw - 32), margin = (vw - wrap) / 2;
    while (y < H - 220) {
      var hit = skips.filter(function (s) { return y > s[0] && y < s[1]; })[0];
      if (hit) { y = hit[1]; continue; }
      var L = looks[n % looks.length], d = document.createElement('div');
      var w = Math.round(L.w * (margin < 150 ? 0.8 : 1)), roomy = margin >= w * 0.75 + 16;
      var pos = roomy
        ? (side ? 'left' : 'right') + ':calc(50% + ' + (wrap / 2 + 16 + L.dx) + 'px)'   // ao lado do conteúdo
        : (side ? 'right' : 'left') + ':' + -Math.round(w * 0.4) + 'px';                // 60% visível, o resto fora da borda
      d.className = 'flt__item';
      d.style.cssText = pos + ';top:' + (y + L.dy) + 'px;--w:' + w + 'px;--rot:' + L.rot.toFixed(1) + 'deg;opacity:' +
        (roomy ? L.op : L.op * 0.9).toFixed(2) + ';animation-duration:' + L.dur.toFixed(1) + 's;animation-delay:' + L.delay.toFixed(1) + 's';
      var im = new Image(); im.src = order[n % order.length]; im.alt = ''; im.width = 400; im.height = 225; im.loading = 'lazy'; im.decoding = 'async';
      d.appendChild(im); layer.appendChild(d);
      y += STEP; n++; side = 1 - side;
    }
  };

  var t0;
  var later = function () { clearTimeout(t0); t0 = setTimeout(build, 200); };
  if (document.readyState === 'complete') build(); else window.addEventListener('load', build);
  window.addEventListener('resize', later);
  // A página pode crescer depois do carregamento (fontes, imagens, FAQ aberto): remonta quando a altura muda
  if ('ResizeObserver' in window) {
    var lastH = 0;
    new ResizeObserver(function () { var h = layer.offsetHeight; if (Math.abs(h - lastH) > 200) { lastH = h; later(); } }).observe(layer);
  }
})();
