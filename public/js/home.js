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
    // abas Desktop / Phone do comparador da home: troca o aparelho e reposiciona o divisor
    var box = cmp.closest('[data-cmp]');
    if (box) box.querySelectorAll('[data-cmp-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        box.setAttribute('data-mode', b.getAttribute('data-cmp-mode'));
        box.querySelectorAll('[data-cmp-mode]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        set(b.getAttribute('data-cmp-mode') === 'phone' ? 30 : 50);   // no celular a pintura começa ocupando mais a tela
      });
    });
  });

  // Coleções: leque de cartões (setas, clique e deslizar) e a ficha ao lado com os dados da coleção escolhida
  safe(function () {
    var box = document.querySelector('[data-colx]'); if (!box) return;
    var items = JSON.parse(box.getAttribute('data-colx-items')), n = items.length, sel = 0;
    var cards = box.querySelectorAll('[data-colx-card]'), txt = box.querySelector('.colx__txt'), count = box.querySelector('[data-colx-count]');
    var f = function (k) { return box.querySelector('[data-colx-f="' + k + '"]'); };
    var half = Math.floor(n / 2), swapT;
    function go(i) {
      sel = (i % n + n) % n;
      cards.forEach(function (c, j) {
        var d = ((j - sel + n + half) % n) - half;
        c.style.setProperty('--d', d); c.style.setProperty('--a', Math.abs(d));
        if (d === 0) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current');
      });
      var it = items[sel];
      box.style.setProperty('--ac', it.accent);
      count.textContent = (sel + 1) + ' / ' + n;
      txt.classList.add('is-swap'); clearTimeout(swapT);
      swapT = setTimeout(function () {
        f('tag').textContent = it.tag; f('name').textContent = it.name; f('why').textContent = it.why; f('price').textContent = it.price;
        f('files').textContent = it.files; f('format').textContent = it.format;
        f('link').textContent = 'Explore ' + it.name; f('link').setAttribute('href', it.page);
        f('cart').setAttribute('data-add-to-cart', it.key);
        txt.classList.remove('is-swap');
      }, 180);
    }
    box.querySelectorAll('[data-colx-step]').forEach(function (b) {
      b.addEventListener('click', function () { go(sel + +b.getAttribute('data-colx-step')); });
    });
    // cartão de trás: traz para a frente; o da frente abre a coleção
    cards.forEach(function (c, j) {
      c.addEventListener('click', function (e) { if (j !== sel) { e.preventDefault(); go(j); } });
    });
    // deslizar o leque com o dedo ou o mouse
    // (só gesto claramente horizontal; no mouse, com o botão apertado, para rolar a página por cima do leque não trocar a coleção)
    var fan = box.querySelector('[data-colx-fan]'), x0 = null, y0 = 0, moved = false;
    fan.addEventListener('pointerdown', function (e) { if (e.isPrimary) { x0 = e.clientX; y0 = e.clientY; moved = false; } });
    fan.addEventListener('pointermove', function (e) {
      if (x0 === null) return;
      if (e.pointerType === 'mouse' && !(e.buttons & 1)) { x0 = null; return; }
      var dx = e.clientX - x0, dy = e.clientY - y0;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 2) return;
      go(sel + (dx < 0 ? 1 : -1)); x0 = null; moved = true;
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { fan.addEventListener(t, function () { x0 = null; }); });
    fan.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    fan.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });

  // Telas em várias resoluções: a miniatura troca a pintura em todas ao mesmo tempo
  safe(function () {
    var box = document.querySelector('[data-screens]'); if (!box) return;
    var imgs = box.querySelectorAll('[data-screens-img]'), btns = box.querySelectorAll('[data-screens-pick]');
    // o comparador de cima (abas Desktop / Phone) acompanha a obra escolhida
    function syncCompare(slug, title) {
      var dir = '/img/home/compare/' + slug, desk = document.querySelector('[data-cmp-img="desk"]'), ph = document.querySelector('[data-cmp-img="phone"]');
      if (!slug || !desk || !ph) return;
      desk.srcset = dir + '-desk-820.webp 820w, ' + dir + '-desk-1280.webp 1280w';
      desk.src = dir + '-desk-1280.webp';
      desk.alt = title + ', an impasto oil painting wallpaper, on a desktop screen';
      ph.src = dir + '-phone.webp';
      ph.alt = 'The phone version of ' + title + ' on a lock screen';
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var src = b.getAttribute('data-screens-pick'), phone = b.getAttribute('data-screens-phone');
        syncCompare(b.getAttribute('data-screens-slug'), b.getAttribute('data-screens-title'));
        btns.forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var pre = new Image();
        pre.onload = function () {
          imgs.forEach(function (im) { im.classList.add('is-swap'); });
          setTimeout(function () {
            imgs.forEach(function (im) { im.src = im.getAttribute('data-screens-img') === 'phone' && phone ? phone : src; im.classList.remove('is-swap'); });
          }, 200);
        };
        pre.src = src;
      });
    });
  });
})();
