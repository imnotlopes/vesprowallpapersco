/* Home VESPRO: carrosséis infinitos, frase revelada palavra por palavra e comparador antes/depois.
 * Cada bloco roda isolado (um erro não derruba os outros); sem JavaScript o conteúdo continua visível. */
(function () {
  var safe = function (fn) { try { fn(); } catch (e) { if (window.console) console.error(e); } };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Carrosséis: duas metades iguais no trilho; arrastáveis; pausam no hover; não animam o que está fora da tela
  safe(function () {
    document.querySelectorAll('[data-marquee]').forEach(function (wrap) {
      var track = wrap.firstElementChild, speed = parseFloat(wrap.getAttribute('data-marquee')) || 40;
      var x = 0, hover = false, drag = false, lastX = 0, last = performance.now(), visible = true;
      wrap.style.overflow = 'hidden';
      track.style.display = 'flex'; track.style.width = 'max-content'; track.style.alignItems = 'flex-end';
      wrap.addEventListener('mouseenter', function () { hover = true; });
      wrap.addEventListener('mouseleave', function () { hover = false; });
      wrap.addEventListener('pointerdown', function (e) { drag = true; lastX = e.clientX; if (wrap.setPointerCapture) wrap.setPointerCapture(e.pointerId); });
      wrap.addEventListener('pointermove', function (e) { if (drag) { x += e.clientX - lastX; lastX = e.clientX; } });
      ['pointerup', 'pointercancel'].forEach(function (t) { wrap.addEventListener(t, function () { drag = false; }); });
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { rootMargin: '200px' }).observe(wrap);
      (function tick(now) {
        var dt = Math.min((now - last) / 1000, 0.1); last = now;
        if (visible) {
          if (!hover && !drag && !reduce) x -= speed * dt;
          var half = track.scrollWidth / 2;
          if (half > 0) x = -(((-x % half) + half) % half);
          track.style.transform = 'translate3d(' + x + 'px,0,0)';
        }
        requestAnimationFrame(tick);
      })(last);
    });
  });

  // Mural: carrega as imagens ~800px antes de aparecer (dentro do carrossel o lazy do navegador deixa fotos vazias)
  safe(function () {
    var sec = document.getElementById('community'); if (!sec) return;
    var go = function () { sec.querySelectorAll('img[loading="lazy"]').forEach(function (i) { i.loading = 'eager'; }); };
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { go(); o.disconnect(); } }, { rootMargin: '800px 0px' });
      o.observe(sec);
    } else go();
  });

  // Frase revelada palavra por palavra conforme a rolagem
  safe(function () {
    var wr = document.querySelector('[data-word-reveal]'); if (!wr || reduce) return;
    var spans = wr.querySelectorAll('span'), N = spans.length, ticking = false;
    var upd = function () {
      var r = wr.getBoundingClientRect(), h = window.innerHeight, a = h * 0.85, o = h * 0.45;
      var p = Math.min(1, Math.max(0, (a - r.top) / (r.height + (a - o))));
      spans.forEach(function (s, i) { s.style.opacity = 0.15 + 0.85 * Math.min(1, Math.max(0, p * N - i)); });
    };
    var onS = function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { upd(); ticking = false; }); } };
    upd(); window.addEventListener('scroll', onS, { passive: true }); window.addEventListener('resize', onS);
  });

  // Comparador antes/depois (mouse, toque e teclado)
  safe(function () {
    var cmp = document.querySelector('[data-compare]'); if (!cmp) return;
    var clip = cmp.querySelector('[data-compare-clip]'), hd = cmp.querySelector('[data-compare-handle]'), down = false, v = 50;
    var set = function (val) {
      v = Math.max(0, Math.min(100, val));
      clip.style.clipPath = clip.style.webkitClipPath = 'inset(0 0 0 ' + v + '%)';
      hd.style.left = v + '%'; cmp.setAttribute('aria-valuenow', Math.round(v));
    };
    var fromX = function (cx) { var r = cmp.getBoundingClientRect(); set((cx - r.left) / r.width * 100); };
    cmp.addEventListener('pointerdown', function (e) { down = true; if (cmp.setPointerCapture) cmp.setPointerCapture(e.pointerId); fromX(e.clientX); });
    cmp.addEventListener('pointermove', function (e) { if (down) fromX(e.clientX); });
    ['pointerup', 'pointercancel'].forEach(function (t) { cmp.addEventListener(t, function () { down = false; }); });
    cmp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { set(v - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { set(v + 5); e.preventDefault(); }
    });
  });
})();
