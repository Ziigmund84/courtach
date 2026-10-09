/* Baptiste Courtachon — animations du site */
(function () {
  'use strict';
  var d = document, root = d.documentElement, body = d.body;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var loader = $('.loader');
  $('#y').textContent = new Date().getFullYear();

  /* ---------- Découpage du texte ---------- */
  function splitChars(el) {
    var text = el.textContent.trim();
    if (!el.closest('[aria-hidden="true"]')) el.setAttribute('aria-label', text);
    el.innerHTML = text.split(' ').map(function (w) {
      return '<span style="display:inline-block;white-space:nowrap" aria-hidden="true">' +
        w.split('').map(function (c) { return '<span class="ch">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  function splitWords(el) {
    var walker = d.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var frag = d.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(part)); return; }
        var s = d.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }
  $$('.split').forEach(function (el) {
    // les lignes du titre principal sont lues via le h1
    splitChars(el);
  });
  var h1 = $('#h1'); h1.setAttribute('aria-label', 'Baptiste Courtachon');
  $$('#h1 .line, .fb h2 .line').forEach(function (l) { l.removeAttribute('aria-label'); l.setAttribute('aria-hidden', 'true'); });
  $('.fb h2').setAttribute('aria-label', 'Suivez-moi sur Facebook');

  /* ---------- Bandeaux : contenu doublé pour une boucle continue ---------- */
  $$('.prow').forEach(function (row) {
    var ul = $('ul', row), c1 = ul.cloneNode(true), c2 = ul.cloneNode(true);
    [c1, c2].forEach(function (c) { c.setAttribute('aria-hidden', 'true'); $$('a', c).forEach(function (a) { a.tabIndex = -1; }); row.appendChild(c); });
  });

  /* ---------- Menu mobile ---------- */
  var burger = $('.burger'), nav = $('#nav'), lenis = null;
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    if (lenis) open ? lenis.stop() : lenis.start(); else body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Liens d'ancre ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var t = $(id); if (!t) return;
      e.preventDefault(); setMenu(false);
      if (lenis) lenis.scrollTo(t, { offset: id === '#accueil' ? 0 : -60, duration: 1.6 });
      else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- Formulaire : prépare un e-mail ---------- */
  var form = $('#form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nom = form.nom.value.trim(), msg = form.message.value.trim();
    if (!nom) { form.nom.setCustomValidity('Indiquez votre nom'); form.nom.reportValidity(); return; }
    if (!msg) { form.message.setCustomValidity('Écrivez votre message'); form.message.reportValidity(); return; }
    var txt = msg + '\n\n' + nom + (form.tel.value.trim() ? '\n' + form.tel.value.trim() : '');
    location.href = 'mailto:baptiste.courtachon@gmail.com?subject=' + encodeURIComponent(form.objet.value + ' – ' + nom) + '&body=' + encodeURIComponent(txt);
  });
  form.addEventListener('input', function (e) { if (e.target.setCustomValidity) e.target.setCustomValidity(''); });

  /* ---------- En-tête ---------- */
  var top = $('#top'), totop = $('.totop'), lastY = 0;
  function onScroll(y) {
    top.classList.toggle('solid', y > 40);
    top.classList.toggle('hide', y > 500 && y > lastY + 2 && !body.classList.contains('menu-open'));
    if (y < lastY - 2) top.classList.remove('hide');
    totop.classList.toggle('show', y > innerHeight);
    lastY = y;
  }

  /* ---------- Sans GSAP ou mouvement réduit : version calme ---------- */
  if (!hasGsap || reduce) {
    if (loader) loader.remove();
    addEventListener('scroll', function () { onScroll(scrollY); }, { passive: true });
    onScroll(scrollY);
    return;
  }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  /* ---------- Défilement fluide ---------- */
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on('scroll', function (e) { ST.update(); onScroll(e.scroll); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  } else {
    addEventListener('scroll', function () { onScroll(scrollY); }, { passive: true });
  }

  /* ---------- États de départ (le loader masque la page) ---------- */
  gsap.set('#h1 .ch', { yPercent: 115, rotate: 8 });
  gsap.set(['.hero .lede', '.hero .ctas', '.facts', '.cue'], { autoAlpha: 0, y: 34 });
  gsap.set('#hk', { autoAlpha: 0 });
  gsap.set('.player', { autoAlpha: 0, y: 140, scale: .96 });
  gsap.set('.hero-bg', { scale: 1.3 });
  gsap.set('.giant', { autoAlpha: 0 });

  /* ---------- Écran d'ouverture ---------- */
  var ring = $('.loader .ring'), len = 2 * Math.PI * 44, pctEl = $('.loader .pct span'), pct = { v: 0 };
  gsap.set(ring, { strokeDasharray: len, strokeDashoffset: len });
  gsap.set('.loader .ball', { scale: 0, transformOrigin: '50% 50%' });
  var ready = Promise.race([
    Promise.all([
      d.fonts ? d.fonts.ready : Promise.resolve(),
      new Promise(function (r) { var i = $('.player'); if (i.complete) r(); else { i.onload = r; i.onerror = r; } })
    ]),
    new Promise(function (r) { setTimeout(r, 2600); })
  ]);
  var load = gsap.timeline();
  load.to('.loader .ball', { scale: 1, duration: .5, ease: 'back.out(3)' })
      .to(ring, { strokeDashoffset: len * 0.14, duration: 1.3, ease: 'power2.inOut' }, 0.1)
      .to(pct, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: function () { pctEl.textContent = Math.round(pct.v); } }, 0.1);
  Promise.all([ready, new Promise(function (r) { load.eventCallback('onComplete', r); })]).then(function () {
    gsap.timeline({ onComplete: function () { loader.remove(); } })
      .to('.loader-in', { y: -40, autoAlpha: 0, duration: .45, ease: 'power2.in' })
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '-=.1')
      .add(intro, '-=.65');
  });

  function intro() {
    if (lenis) lenis.start();
    var tl = gsap.timeline();
    tl.to('.hero-bg', { scale: 1, duration: 2.4, ease: 'expo.out' }, 0)
      .to('#h1 .ch', { yPercent: 0, rotate: 0, duration: 1.2, ease: 'expo.out', stagger: .035 }, .1)
      .to('.player', { autoAlpha: 1, y: 0, scale: 1, duration: 1.6, ease: 'expo.out' }, .25)
      .to('.giant', { autoAlpha: 1, duration: 2 }, .5)
      .to('#hk', { autoAlpha: 1, duration: .5 }, .55)
      .fromTo('#hk', { backgroundSize: '0% .22em' }, { backgroundSize: '100% .22em', duration: .9, ease: 'expo.inOut' }, .6)
      .to(['.hero .lede', '.hero .ctas'], { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .12 }, .6)
      .to(['.facts', '.cue'], { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out' }, .85)
      .from('.facts div', { y: 30, autoAlpha: 0, duration: .8, stagger: .1, ease: 'expo.out' }, .95)
      .from('.count', { textContent: 0, duration: 1.2, snap: { textContent: 1 }, ease: 'power2.out' }, 1);
    return tl;
  }

  /* ---------- Hero : boucle du texte géant, parallaxe ---------- */
  gsap.to('.giant', { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
  var heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero-bg', { yPercent: 14, ease: 'none', scrollTrigger: heroST });
  gsap.to('.hero-inner', { y: -160, opacity: 0, ease: 'none', scrollTrigger: heroST });
  gsap.to('.player-wrap', { y: 120, ease: 'none', scrollTrigger: heroST });
  if (fine) {
    var px = gsap.quickTo('.player-wrap', 'x', { duration: 1.2, ease: 'power3' });
    var gx = gsap.quickTo('.giant', 'y', { duration: 1.4, ease: 'power3' });
    $('.hero').addEventListener('mousemove', function (e) {
      var rx = e.clientX / innerWidth - .5, ry = e.clientY / innerHeight - .5;
      px(rx * -30); gx(ry * 24);
    });
  }

  /* ---------- Surligneurs et titres ---------- */
  $$('.kicker').forEach(function (k) {
    if (k.id === 'hk') return;
    gsap.fromTo(k, { backgroundSize: '0% .42em' }, { backgroundSize: '100% .42em', duration: 1, ease: 'expo.inOut', scrollTrigger: { trigger: k, start: 'top 88%' } });
  });
  $$('.title').forEach(function (t) {
    gsap.from(t, { y: 50, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 88%' } });
  });

  /* ---------- Manifeste : les mots s'allument au défilement ---------- */
  var mp = $('.reveal-words');
  splitWords(mp);
  gsap.fromTo($$('.w', mp), { opacity: .12 }, { opacity: 1, ease: 'none', stagger: .08, scrollTrigger: { trigger: mp, start: 'top 82%', end: 'bottom 48%', scrub: .6 } });
  $$('.hl', mp).forEach(function (h) {
    gsap.fromTo(h, { '--hl': '0%' }, { '--hl': '100%', ease: 'none', scrollTrigger: { trigger: h, start: 'top 68%', end: 'top 50%', scrub: .6 } });
  });
  gsap.from('.manifest .sig', { y: 30, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.manifest .sig', start: 'top 92%' } });

  var mm = gsap.matchMedia();

  /* ---------- Parcours : défilement horizontal (grand écran) ---------- */
  mm.add('(min-width: 901px)', function () {
    var track = $('.track');
    var dist = function () { return Math.max(0, track.scrollWidth - innerWidth); };
    var h = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: '.pin', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
    });
    gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.pin', start: 'top top', end: function () { return '+=' + dist(); }, scrub: true } });
    $$('.step').forEach(function (s) {
      gsap.fromTo($('.yr', s), { xPercent: 60 }, { xPercent: -10, ease: 'none', scrollTrigger: { trigger: s, containerAnimation: h, start: 'left right', end: 'right left', scrub: true } });
      gsap.fromTo($('.ph img', s), { scale: 1.25, xPercent: 8 }, { scale: 1.05, xPercent: -8, ease: 'none', scrollTrigger: { trigger: s, containerAnimation: h, start: 'left right', end: 'right left', scrub: true } });
      gsap.from($('.txt', s), { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: s, containerAnimation: h, start: 'left 75%' } });
    });
  });
  mm.add('(max-width: 900px)', function () {
    $$('.panel').forEach(function (p) {
      gsap.from(p, { y: 60, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 88%' } });
    });
  });

  /* ---------- Trackman : la balle trace sa trajectoire ---------- */
  var trace = $('.flight .trace'), ball = $('.flight .ball'), tl = trace.getTotalLength();
  gsap.set(trace, { strokeDasharray: tl, strokeDashoffset: tl });
  var flight = { p: 0 };
  gsap.to(flight, {
    p: 1, ease: 'none',
    scrollTrigger: { trigger: '.tech', start: 'top 75%', end: 'bottom 35%', scrub: .8 },
    onUpdate: function () {
      var l = tl * flight.p, pt = trace.getPointAtLength(l);
      trace.style.strokeDashoffset = tl - l; ball.setAttribute('cx', pt.x); ball.setAttribute('cy', pt.y);
    }
  });
  gsap.from('.tm-visual img', { y: 120, rotate: -10, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: '.tech', start: 'top 85%', end: 'center 60%', scrub: 1 } });
  gsap.to('.tm-visual .halo', { rotate: 360, duration: 40, repeat: -1, ease: 'none' });
  gsap.fromTo('.tm-visual .halo2', { scale: .8 }, { scale: 1.15, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.from('.metrics li', { y: 30, autoAlpha: 0, duration: .8, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.metrics', start: 'top 88%' } });
  gsap.from('.places span', { x: -20, autoAlpha: 0, duration: .8, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.places', start: 'top 92%' } });

  /* ---------- Fondamentaux : révélation des photos ---------- */
  $$('.basic').forEach(function (b, i) {
    var ph = $('.ph', b), img = $('img', b);
    gsap.timeline({ scrollTrigger: { trigger: b, start: 'top 85%' } })
      .fromTo(ph, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', delay: i * .08 })
      .from(img, { scale: 1.4, duration: 1.8, ease: 'expo.out' }, '<.2')
      .from($('.card', b), { y: 60, autoAlpha: 0, duration: 1, ease: 'expo.out' }, '<.4');
    gsap.fromTo(img, { yPercent: -8 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- Tarifs : cartes qui basculent ---------- */
  gsap.from('.price', { y: 90, rotateX: -35, autoAlpha: 0, transformOrigin: '50% 0%', duration: 1.2, stagger: .09, ease: 'expo.out', scrollTrigger: { trigger: '.prices', start: 'top 85%' } });
  gsap.from('.price .v', { textContent: 0, duration: 1.4, snap: { textContent: 1 }, ease: 'power2.out', stagger: .09, scrollTrigger: { trigger: '.prices', start: 'top 85%' } });
  if (fine) {
    $$('.tilt').forEach(function (c) {
      var rx = gsap.quickTo(c, 'rotationX', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(c, 'rotationY', { duration: .5, ease: 'power3' });
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        rx((.5 - y) * 14); ry((x - .5) * 14);
        c.style.setProperty('--gx', x * 100 + '%'); c.style.setProperty('--gy', y * 100 + '%');
      });
      c.addEventListener('mouseleave', function () { rx(0); ry(0); });
    });
  }

  /* ---------- Bandeaux qui suivent la vitesse de défilement ---------- */
  function velocityLoop(el, dur, dir) {
    var step = 100 / el.children.length;
    var loop = dir < 0
      ? gsap.fromTo(el, { xPercent: 0 }, { xPercent: -step, duration: dur, ease: 'none', repeat: -1 })
      : gsap.fromTo(el, { xPercent: -step }, { xPercent: 0, duration: dur, ease: 'none', repeat: -1 });
    loop.totalTime(dur * 1000);
    ST.create({
      trigger: el, start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) {
        var v = Math.min(Math.abs(self.getVelocity()) / 300, 6);
        gsap.to(loop, { timeScale: self.direction * (1 + v), duration: .25, overwrite: true });
        gsap.to(loop, { timeScale: self.direction, duration: 1.2, delay: .25 });
      }
    });
  }
  velocityLoop($('.ticker-row'), 26, -1);
  $$('.prow').forEach(function (r) { velocityLoop(r, 40, +r.dataset.dir); });

  /* ---------- Stages : cartes empilées ---------- */
  mm.add('(min-width: 861px)', function () {
    var evs = $$('.event');
    evs.forEach(function (ev, i) {
      if (i < evs.length - 1) {
        gsap.to(ev, { scale: .9 - (evs.length - 2 - i) * .02, filter: 'brightness(.55)', ease: 'none', scrollTrigger: { trigger: evs[i + 1], start: 'top 85%', end: 'top 20%', scrub: true } });
      }
      if ($('.word', ev)) gsap.fromTo($('.word', ev), { rotate: 4, scale: .85 }, { rotate: -8, scale: 1.08, ease: 'none', scrollTrigger: { trigger: ev, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
  mm.add('(max-width: 860px)', function () {
    $$('.event').forEach(function (ev) { gsap.from(ev, { y: 60, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: ev, start: 'top 88%' } }); });
  });

  /* ---------- Facebook, contact, pied de page ---------- */
  gsap.from('.fb .ch', { yPercent: 110, rotate: 6, duration: 1.1, stagger: .025, ease: 'expo.out', scrollTrigger: { trigger: '.fb', start: 'top 75%' } });
  gsap.from('.fb p, .fb .btn', { y: 30, autoAlpha: 0, duration: 1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.fb', start: 'top 70%' } });
  gsap.from('.bigphone .d', { yPercent: 110, duration: 1, stagger: .03, ease: 'expo.out', scrollTrigger: { trigger: '.bigphone', start: 'top 88%' } });
  gsap.from('.form', { y: 80, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.form', start: 'top 88%' } });
  gsap.from('.foot-giant .ch', { yPercent: 100, ease: 'none', stagger: .06, scrollTrigger: { trigger: 'footer', start: 'top bottom', end: 'bottom bottom', scrub: .6 } });
  gsap.from('.partners .prow', { x: function (i) { return i ? -120 : 120; }, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.partners', start: 'top 80%' } });

  /* ---------- Lien actif dans le menu ---------- */
  $$('main section[id]').forEach(function (s) {
    var a = nav.querySelector('a[href="#' + s.id + '"]'); if (!a) return;
    ST.create({ trigger: s, start: 'top 50%', end: 'bottom 50%', onToggle: function (self) { if (self.isActive) { $$('a', nav).forEach(function (x) { x.classList.remove('active'); }); a.classList.add('active'); } else a.classList.remove('active'); } });
  });

  /* ---------- Curseur et boutons aimantés ---------- */
  if (fine) {
    root.classList.add('has-cursor');
    var cur = $('.cursor'), dot = $('.cursor-dot');
    var cx = gsap.quickTo(cur, 'x', { duration: .45, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: .45, ease: 'power3' });
    var dx = gsap.quickTo(dot, 'x', { duration: .08 }), dy = gsap.quickTo(dot, 'y', { duration: .08 });
    gsap.set([cur, dot], { autoAlpha: 0 });
    var shown = false;
    addEventListener('mousemove', function (e) {
      if (!shown) { shown = true; gsap.set([cur, dot], { x: e.clientX, y: e.clientY }); gsap.to([cur, dot], { autoAlpha: 1, duration: .3 }); }
      cx(e.clientX); cy(e.clientY); dx(e.clientX); dy(e.clientY);
    });
    d.addEventListener('mouseover', function (e) { if (e.target.closest('a,button,select,.tilt')) cur.classList.add('hover'); });
    d.addEventListener('mouseout', function (e) { if (e.target.closest('a,button,select,.tilt')) cur.classList.remove('hover'); });
    d.addEventListener('mouseleave', function () { gsap.to([cur, dot], { autoAlpha: 0, duration: .2 }); });
    d.addEventListener('mouseenter', function () { gsap.to([cur, dot], { autoAlpha: 1, duration: .2 }); });
    $$('.magnetic').forEach(function (m) {
      var mx = gsap.quickTo(m, 'x', { duration: .6, ease: 'power3' }), my = gsap.quickTo(m, 'y', { duration: .6, ease: 'power3' });
      m.addEventListener('mousemove', function (e) { var r = m.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .3); my((e.clientY - r.top - r.height / 2) * .4); });
      m.addEventListener('mouseleave', function () { gsap.to(m, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,.4)' }); });
    });
  }

  addEventListener('load', function () { ST.refresh(); });
})();
