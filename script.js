/* =========================================================
   CONFIGURAÇÃO — edite aqui os dados de cada clínica.
   Todos os textos marcados com data-c="..." no HTML
   são preenchidos automaticamente a partir deste objeto.
   ========================================================= */
const CONFIG = {
  nome: 'Sua Logo',
  nomeCurto: 'Sua Logo',
  whatsapp: '5500000000000',            // DDI + DDD + número, só dígitos
  telefone: '(00) 0000-0000',
  email: 'contato@suaclinica.com.br',
  instagram: '@suaclinica',
  endereco: 'Rua Exemplo, 123 — Centro, Sua Cidade',
  horario: 'Seg a Sex, 8h às 19h · Sáb, 8h às 12h',
  responsavel: 'Dr(a). Nome Sobrenome — CRO-UF 00000',
  framesDir: 'assets/frames',           // quadros do vídeo do hero (f000.webp … f120.webp)
  frames: 121
};

/* Depoimentos de EXEMPLO — troque pelos depoimentos reais da clínica. */
const REVIEWS = [
  ['Mariana A.', 'Clareamento', 'Fui muito bem recebida desde a recepção. Explicaram cada etapa e o resultado ficou natural, do jeito que eu queria.'],
  ['Rafael C.', 'Implantes', 'Eu tinha muito receio de fazer implante. A equipe me deixou tranquilo do início ao fim. Recomendo de olhos fechados.'],
  ['Juliana M.', 'Lentes de contato dental', 'Meu sorriso mudou e minha autoestima também. Atendimento impecável e um ambiente lindo.'],
  ['Carlos E.', 'Prevenção', 'Pontualidade, cuidado e atenção aos detalhes. Finalmente encontrei a clínica da família.'],
  ['Patrícia L.', 'Odontopediatria', 'Meu filho tinha pavor de dentista e hoje pede para voltar. Atendimento lúdico e muito carinhoso.'],
  ['Bruno S.', 'Alinhadores invisíveis', 'Ninguém percebe que estou usando. O acompanhamento é próximo e as consultas são rápidas.'],
  ['Fernanda R.', 'Ortodontia', 'Profissionais atenciosos e um plano de tratamento super claro, inclusive nos valores.'],
  ['Ana P.', 'Endodontia', 'Fiz canal sem sentir dor. Nunca imaginei que seria tão tranquilo.']
];

const SPECIALTIES = ['Implantes', 'Lentes de contato dental', 'Clareamento', 'Alinhadores invisíveis', 'Ortodontia', 'Odontopediatria', 'Endodontia', 'Prevenção'];

(() => {
  'use strict';

  /* ---------------- utilidades ---------------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mqNav = matchMedia('(min-width: 1101px)');   // menu completo no header
  const mqWide = matchMedia('(min-width: 901px)');   // layout desktop do hero

  /* ---------------- dados da clínica ---------------- */
  $$('[data-c]').forEach(el => { const v = CONFIG[el.dataset.c]; if (v != null) el.textContent = v; });
  document.title = CONFIG.nome;
  $('.year').textContent = new Date().getFullYear();
  const waBase = 'https://wa.me/' + CONFIG.whatsapp;
  $('.wa-float').href = waBase + '?text=' + encodeURIComponent(`Olá! Vim pelo site da ${CONFIG.nome} e gostaria de agendar uma avaliação.`);

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------------- divide textos em palavras ---------------- */
  function split(el) {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.className = 'wi'; i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    return $$('.wi', el);
  }
  const words = new Map();
  $$('[data-split], [data-scrub-words], .foot-word').forEach(el => words.set(el, split(el)));

  /* ---------------- smooth scroll (Lenis) ---------------- */
  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  function scrollToTarget(hash) {
    const t = hash === '#inicio' ? null : $(hash);
    if (hash !== '#inicio' && !t) return;
    const y = t ? t.getBoundingClientRect().top + window.scrollY : 0;
    if (lenis) lenis.scrollTo(y, { duration: 2, easing: x => 1 - Math.pow(1 - x, 4) });
    else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  }
  $$('[data-link]').forEach(a => a.addEventListener('click', e => {
    const h = a.getAttribute('href');
    if (!h || h[0] !== '#') return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(h);
  }));

  /* ---------------- menu mobile ---------------- */
  const burger = $('.burger');
  function closeMenu() {
    if (!document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    $('.mobile-menu').setAttribute('aria-hidden', 'true');
    lenis && lenis.start();
  }
  burger.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    if (!open) return closeMenu();
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    $('.mobile-menu').setAttribute('aria-hidden', 'false');
    lenis && lenis.stop();
    gsap.fromTo('.mobile-menu nav a', { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.9, ease: 'expo.out', delay: 0.15 });
  });

  /* =========================================================
     HERO — quadros do vídeo desenhados num canvas
     ========================================================= */
  const stage = $('.hero-stage');
  const media = $('.hero-media');
  const heroCanvas = $('#heroCanvas');
  const hctx = heroCanvas.getContext('2d');
  const frames = [];
  let frameCount = 0;
  let lastDraw = '';
  const H = { p: 0, zoom: 1, intro: 1.18, cx: 0, cy: 0 };
  let heroDirty = true;

  function nearestFrame(p) {
    if (!frameCount) return null;
    const i = Math.round(clamp(p, 0, 1) * (frameCount - 1));
    if (frames[i]) return frames[i];
    for (let d = 1; d < frameCount; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  }

  // a fonte tem 854px: renderizar acima de 1x só gastaria GPU sem ganhar nitidez
  function fitCanvas(c) {
    const r = c.getBoundingClientRect();
    const dpr = 1;
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; return true; }
    return false;
  }

  function drawCover(ctx, img, cw, ch, zoom, ox, oy) {
    const iw = img.videoWidth || img.width, ih = img.videoHeight || img.height;
    if (!iw || !ih) return;
    const s = Math.max(cw / iw, ch / ih) * zoom;
    const dw = iw * s, dh = ih * s;
    ctx.drawImage(img, (cw - dw) / 2 + ox, (ch - dh) / 2 + oy, dw, dh);
  }

  function drawHero() {
    const w = heroCanvas.width, h = heroCanvas.height;
    const f = nearestFrame(H.p);
    const z = H.zoom * H.intro;
    const key = `${f ? frames.indexOf(f) : -1}|${z.toFixed(4)}|${H.cx.toFixed(4)}|${H.cy.toFixed(4)}|${w}|${h}`;
    if (key === lastDraw) return;      // nada mudou: não redesenha
    lastDraw = key;
    hctx.fillStyle = '#071217';
    hctx.fillRect(0, 0, w, h);
    if (!f) return;
    drawCover(hctx, f, w, h, z, H.cx * w, H.cy * h);
  }

  /* Os quadros do vídeo são imagens WebP prontas (assets/frames).
     Trocar de imagem é instantâneo — nada de decodificar vídeo durante o scroll. */
  function loadFrames(onProgress, onCoarse) {
    const n = CONFIG.frames;
    frameCount = n;
    const order = [], seen = new Set();
    const add = i => { if (!seen.has(i)) { seen.add(i); order.push(i); } };
    add(0); add(n - 1);
    [8, 4].forEach(st => { for (let i = 0; i < n; i += st) add(i); });
    const coarseLen = order.length;              // primeiro uma versão "grossa"…
    [2, 1].forEach(st => { for (let i = 0; i < n; i += st) add(i); });  // …depois o resto
    const useBitmap = 'createImageBitmap' in window && !isTouch;

    return new Promise(resolve => {
      let next = 0, active = 0, settled = 0, coarse = 0;
      const pump = () => {
        while (active < 6 && next < order.length) {
          const k = next++, i = order[k];
          active++;
          const img = new Image();
          img.decoding = 'async';
          img.src = `${CONFIG.framesDir}/f${String(i).padStart(3, '0')}.webp`;
          img.decode()
            .then(() => (useBitmap ? createImageBitmap(img) : img))
            .then(src => { frames[i] = src; heroDirty = true; }, () => {})
            .finally(() => {
              active--; settled++;
              if (k < coarseLen) { coarse++; onProgress(coarse / coarseLen); if (coarse === coarseLen) onCoarse(); }
              if (settled === order.length) resolve();
              pump();
            });
        }
      };
      pump();
    });
  }

  /* ---------------- preloader ---------------- */
  const pre = { p: 0 };
  const preFill = $('.pre-bar span'), prePct = $('.pre-pct'), preTooth = $('.pre-tooth');
  const renderPre = () => {
    preFill.style.transform = `scaleX(${pre.p})`;
    prePct.textContent = Math.round(pre.p * 100) + '%';
    preTooth.style.strokeDashoffset = 80 * (1 - pre.p);
  };
  const coarseReady = new Promise(res => {
    loadFrames(p => gsap.to(pre, { p, duration: 0.35, overwrite: true, onUpdate: renderPre }), res).then(res);
  });
  const minTime = new Promise(r => setTimeout(r, 1300));
  const safety = new Promise(r => setTimeout(r, 10000));
  Promise.race([Promise.all([coarseReady, minTime]), safety]).then(finishLoading);

  let loaded = false;
  function finishLoading() {
    if (loaded) return; loaded = true;
    const tl = gsap.timeline();
    tl.to(pre, { p: 1, duration: 0.4, ease: 'power2.out', onUpdate: renderPre })
      .to('.pre-inner', { y: -30, opacity: 0, duration: 0.5, ease: 'power2.in' })
      .to('.preloader', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.1')
      .add(() => {
        document.body.classList.remove('is-loading');
        $('.preloader').remove();
        lenis && lenis.start();
        ScrollTrigger.refresh();
      })
      .add(intro, '-=0.75');
  }

  function intro() {
    const t = gsap.timeline({ defaults: { ease: 'expo.out' } });
    t.to(H, { intro: 1, duration: 2.4, onUpdate: () => (heroDirty = true) }, 0)
      .from('.logo, .header > .btn', { y: -40, opacity: 0, duration: 1.2, stagger: 0.1 }, 0.2)
      .from('.burger', { scale: 0.5, opacity: 0, duration: 1.2 }, 0.3)
      .from('.nav a', { y: -20, opacity: 0, duration: 1, stagger: 0.07 }, 0.3)
      .from('.ch1 .eyebrow', { opacity: 0, y: 20, duration: 1 }, 0.5)
      .from(words.get($('.ch1 h1')), { yPercent: 115, duration: 1.3, stagger: 0.05 }, 0.55)
      .from('.scroll-hint', { opacity: 0, y: 20, duration: 1 }, 1.1)
      .from('.hero-progress', { opacity: 0, x: 20, duration: 1 }, 1.1);
  }

  function finalClip() {
    const W = window.innerWidth, Hh = stage.clientHeight;
    return mqWide.matches
      ? `inset(${Hh * 0.13}px ${W * 0.04}px ${Hh * 0.13}px ${W * 0.5}px round 32px)`
      : `inset(${Hh * 0.11}px ${W * 0.05}px ${Hh * 0.57}px ${W * 0.05}px round 24px)`;
  }
  gsap.set(media, { clipPath: 'inset(0px 0px 0px 0px round 0px)' });

  const hpFill = $('.hp-fill'), hpLabel = $('.hp-label'), header = $('.header'), heroFinal = $('.hero-final'), waFloat = $('.wa-float');
  const chapters = ['01 · Chegada', '02 · Acolhimento', '03 · Tecnologia', '04 · Seu sorriso'];
  let heroP = 0, pastHero = false;
  // no celular o botão do WhatsApp some enquanto as boas-vindas estão na tela (não cobre os botões)
  const syncWa = () => waFloat.classList.toggle('show', heroP > 0.12 && (heroP < 0.78 || pastHero));
  ScrollTrigger.create({ trigger: '.bands', start: 'top 55%', onToggle: s => { pastHero = s.isActive || s.progress > 0; syncWa(); }, end: 'max' });

  const heroTL = gsap.timeline({
    defaults: { ease: 'none' },
    onUpdate: () => (heroDirty = true),
    scrollTrigger: {
      trigger: '.hero', start: 'top top', end: 'bottom bottom',
      scrub: reduced ? true : 0.9, invalidateOnRefresh: true,
      onUpdate(self) {
        const p = self.progress;
        hpFill.style.transform = `scaleY(${p})`;
        hpLabel.textContent = chapters[p < 0.22 ? 0 : p < 0.46 ? 1 : p < 0.7 ? 2 : 3];
        header.classList.toggle('is-light', p > 0.8);
        heroFinal.classList.toggle('is-active', p > 0.85);
        heroP = p; syncWa();
      }
    }
  });

  // 1) o vídeo avança com o scroll (as portas se abrem) e a câmera "entra"
  heroTL.to(H, { p: 1, duration: 0.72 }, 0)
    .to(H, { zoom: 1.16, duration: 0.72, ease: 'power1.in' }, 0)
    .to('.scroll-hint', { autoAlpha: 0, duration: 0.04 }, 0);

  // 2) capítulos da história
  heroTL.to('.ch1', { autoAlpha: 0, y: -60, duration: 0.1 }, 0.07);
  [['.ch2', 0.24, 0.42], ['.ch3', 0.48, 0.64]].forEach(([sel, a, b]) => {
    heroTL.fromTo(sel, { autoAlpha: 0, y: 0 }, { autoAlpha: 1, duration: 0.01 }, a)
      .fromTo(sel + ' .eyebrow', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.05 }, a)
      .fromTo(words.get($(sel + ' h2')), { yPercent: 115 }, { yPercent: 0, stagger: 0.006, duration: 0.07, ease: 'power3.out' }, a)
      .to(sel, { autoAlpha: 0, y: -50, duration: 0.07 }, b);
  });
  heroTL.to('.hero-glow', { opacity: 0.7, duration: 0.14 }, 0.55)
    .to('.hero-glow', { opacity: 0, duration: 0.1 }, 0.74);

  // 3) o vídeo "anda" e vira um card, revelando as boas-vindas
  heroTL.to(media, { clipPath: () => finalClip(), duration: 0.2, ease: 'power2.inOut' }, 0.72)
    .to(H, { p: 0.5, zoom: 1, duration: 0.2, ease: 'power2.inOut' }, 0.72)
    .to(H, { cx: () => (mqWide.matches ? 0.217 : 0), cy: () => (mqWide.matches ? 0 : -0.217), duration: 0.2, ease: 'power2.inOut' }, 0.72)
    .to('.hero-shade', { opacity: 0.12, duration: 0.2 }, 0.72)
    .to('.hero-progress', { autoAlpha: 0, duration: 0.05 }, 0.72)
    .fromTo('.hero-final .eyebrow', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.8)
    .fromTo(words.get($('.hero-final h2')), { yPercent: 115 }, { yPercent: 0, stagger: 0.005, duration: 0.08, ease: 'power3.out' }, 0.81)
    .fromTo(['.hero-final .lead', '.hero-final .actions', '.hero-final .trust'], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.02, duration: 0.06 }, 0.86)
    // o card do vídeo "revela" a foto da consulta (pessoas reais, imagem nítida)
    .fromTo('.final-photo', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.07 }, 0.85)
    .fromTo('.final-photo img', { scale: 1.12 }, { scale: 1, duration: 0.12, ease: 'power2.out' }, 0.85)
    // a segunda foto entra girando por cima
    .fromTo('.final-photo-2', { autoAlpha: 0, y: 80, rotate: 12, scale: 0.85 }, { autoAlpha: 1, y: 0, rotate: 5, scale: 1, duration: 0.08, ease: 'back.out(1.6)' }, 0.89)
    .fromTo('.chip-a', { autoAlpha: 0, y: 30, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.06, ease: 'back.out(2)' }, 0.91)
    .fromTo('.chip-b', { autoAlpha: 0, y: -20, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.06, ease: 'back.out(2)' }, 0.92)
    .to({}, { duration: 0.02 }, 0.98);

  gsap.to('.chip-a', { y: '-=10', duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  // parallax do vídeo com o mouse
  if (!isTouch) {
    const px = gsap.quickTo('.hero-par', 'x', { duration: 1.2, ease: 'power3.out' });
    const py = gsap.quickTo('.hero-par', 'y', { duration: 1.2, ease: 'power3.out' });
    stage.addEventListener('pointermove', e => {
      px((e.clientX / innerWidth - 0.5) * -24);
      py((e.clientY / innerHeight - 0.5) * -18);
    });
  }

  /* =========================================================
     FAIXAS CRUZADAS + DEPOIMENTOS (marquee com velocidade do scroll)
     ========================================================= */
  const marquees = [];
  const bandHTML = SPECIALTIES.map(s => `<span>${s} <i>✦</i></span>`).join('');
  $$('.band-track').forEach((tr, i) => {
    tr.innerHTML = bandHTML.repeat(3) + bandHTML.repeat(3);
    marquees.push({ tr, x: 0, dir: i ? 1 : -1, base: 1.1, speed: 1.1, boost: 0.5, w: 0 });
  });

  const star = '<svg viewBox="0 0 24 24"><use href="#star"/></svg>';
  const rcard = ([n, t, txt]) => `<article class="rcard"><div class="stars">${star.repeat(5)}</div><p>“${txt}”</p><div class="who"><span class="avatar">${n[0]}</span><div><b>${n}</b><small>${t}</small></div></div></article>`;
  $$('.marquee').forEach((m, i) => {
    const tr = $('.marquee-track', m);
    const group = REVIEWS.slice(i * 4, i * 4 + 4).map(rcard).join('').repeat(3);
    tr.innerHTML = group + group;
    const obj = { tr, x: 0, dir: +m.dataset.dir, base: 0.6, speed: 0.6, boost: 0.15, w: 0 };
    marquees.push(obj);
    m.addEventListener('pointerenter', () => (obj.base = 0.08));
    m.addEventListener('pointerleave', () => (obj.base = 0.6));
  });
  // só anima as faixas que estão na tela
  const io = new IntersectionObserver(es => es.forEach(e => { const m = marquees.find(x => x.tr === e.target); if (m) m.visible = e.isIntersecting; }));
  marquees.forEach(m => io.observe(m.tr));
  const measureMarquees = () => marquees.forEach(m => (m.w = m.tr.scrollWidth / 2));
  measureMarquees();
  ScrollTrigger.addEventListener('refresh', measureMarquees);

  /* ---------------- loop de renderização ---------------- */
  gsap.ticker.add(() => {
    if (heroDirty) { heroDirty = false; drawHero(); }
    const dr = gsap.ticker.deltaRatio(60);
    const vel = lenis ? lenis.velocity : 0;
    const sdir = lenis && lenis.direction ? lenis.direction : 1;
    marquees.forEach(m => {
      if (!m.w || !m.visible) return;
      m.speed += (m.base - m.speed) * 0.08;
      const v = (m.speed + Math.min(Math.abs(vel) * m.boost, 30)) * m.dir * (reduced ? 0 : sdir);
      m.x -= v * dr;
      if (m.x <= -m.w) m.x += m.w;
      if (m.x > 0) m.x -= m.w;
      m.tr.style.transform = `translate3d(${m.x}px,0,0)`;
    });
  });

  function resizeCanvases() {
    fitCanvas(heroCanvas);
    heroDirty = true;
  }
  resizeCanvases();
  ScrollTrigger.addEventListener('refresh', resizeCanvases);
  window.addEventListener('resize', resizeCanvases);

  /* =========================================================
     MANIFESTO + NÚMEROS
     ========================================================= */
  gsap.to(words.get($('.manifesto-text')), {
    opacity: 1, stagger: 0.1, ease: 'none',
    scrollTrigger: { trigger: '.manifesto-text', start: 'top 82%', end: 'bottom 45%', scrub: true }
  });

  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: () => (el.textContent = pre + Math.round(o.v).toLocaleString('pt-BR') + suf) })
    });
  });

  /* =========================================================
     TRATAMENTOS — grade de cards (o scroll segue livre, sem travar)
     ========================================================= */
  ScrollTrigger.batch('.tcard', {
    start: 'top 92%', once: true,
    onEnter: b => gsap.fromTo(b, { y: 70, opacity: 0, rotate: 2 }, { y: 0, opacity: 1, rotate: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out' })
  });
  $$('.tcard').forEach(c => {
    gsap.set(c, { opacity: 0 });
    if (isTouch) return;
    const rx = gsap.quickTo(c, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(c, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    gsap.set(c, { transformPerspective: 900 });
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
      rx((y - 0.5) * -10); ry((x - 0.5) * 12);
    });
    c.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });

  /* =========================================================
     SIMULADOR DE CLAREAMENTO
     ========================================================= */
  const NS = 'http://www.w3.org/2000/svg';
  const SHADES = [['A3,5', '#d4b17c'], ['A3', '#dfc394'], ['A2', '#e8d3aa'], ['A1', '#efe1c2'], ['B1', '#f5ecd8'], ['BL4', '#f8f3e7'], ['BL2', '#fbf8f1'], ['BL1', '#fffefb']];
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
  const topY = x => { const t = (x - 78) / 444; return 150 - 116 * t * (1 - t); };
  const edgeY = x => 206 - Math.pow((x - 300) / 235, 2) * 58;
  const up = $('.teeth-upper'), low = $('.teeth-lower');
  const shines = [];
  [[low, [36, 34, 33, 32, 30], true], [up, [60, 50, 43, 38, 34], false]].forEach(([g, ws, lower]) => {
    [-1, 1].forEach(side => {
      let x0 = 300;
      ws.forEach((w, k) => {
        const a = side > 0 ? x0 : x0 - w;
        const xc = a + w / 2;
        const yb = edgeY(xc);
        const yt = lower ? yb - 8 : topY(xc) - 16;
        const hh = lower ? 340 - yt : yb - yt;
        mk('rect', { x: a + 1.2, y: yt, width: w - 2.4, height: hh, rx: Math.min(16, w * 0.32), fill: 'url(#tg)', stroke: 'rgba(110,70,40,.22)', 'stroke-width': 1.4 }, g);
        mk('rect', { x: a + 1.2, y: yt, width: w - 2.4, height: hh, rx: Math.min(16, w * 0.32), fill: '#3a1a10', opacity: (lower ? 0.28 : 0) + k * 0.07 }, g);
        if (!lower && k < 2) shines.push(mk('rect', { x: a + (side > 0 ? w * 0.22 : w * 0.5), y: yb - 62, width: w * 0.2, height: 40, rx: 6, fill: '#fff', opacity: 0.15 }, g));
        x0 += side * w;
      });
    });
  });
  const spark = $('.sparkles');
  [[200, 168, 1], [392, 150, 0.8], [300, 132, 0.6], [470, 182, 0.7], [125, 172, 0.5]].forEach(([x, y, s], i) => {
    const g = mk('g', { transform: `translate(${x} ${y}) scale(${s})` }, spark);
    const p = mk('path', { d: 'M0-14 3-3 14 0 3 3 0 14-3 3-14 0-3-3Z' }, g);
    p.style.cssText = `transform-box:fill-box;transform-origin:center;animation:tw 1.8s ${i * 0.3}s infinite ease-in-out`;
  });
  const sty = document.createElement('style');
  sty.textContent = '@keyframes tw{0%,100%{transform:scale(.5) rotate(0);opacity:.4}50%{transform:scale(1.15) rotate(45deg);opacity:1}}';
  document.head.appendChild(sty);

  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mixHex = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
  const darker = (rgb, f) => rgb.replace(/\d+/g, n => Math.round(n * f));
  const tg1 = $('.tg1'), tg2 = $('.tg2'), range = $('.sim-range'), shadeEl = $('.sim-shade'), pctEl = $('.sim-pct');
  const sim = { v: 0 };
  function setShade(v) {
    v = clamp(v, 0, 100); sim.v = v;
    const n = SHADES.length - 1, f = (v / 100) * n, i = Math.min(n - 1, Math.floor(f)), t = f - i;
    const c = mixHex(SHADES[i][1], SHADES[i + 1][1], t);
    tg1.setAttribute('stop-color', c);
    tg2.setAttribute('stop-color', darker(c, 0.9 + 0.06 * (v / 100)));
    shadeEl.textContent = SHADES[Math.round(f)][0];
    pctEl.textContent = Math.round(v) + '%';
    if (+range.value !== Math.round(v)) range.value = Math.round(v);
    spark.style.opacity = clamp((v - 62) / 38, 0, 1);
    shines.forEach(s => s.setAttribute('opacity', 0.12 + 0.5 * (v / 100)));
  }
  setShade(0);
  let demo = null;
  const stopDemo = () => { demo && demo.kill(); demo = null; };
  range.addEventListener('input', () => { stopDemo(); setShade(+range.value); });
  ScrollTrigger.create({
    trigger: '.sim-stage', start: 'top 70%', once: true,
    onEnter: () => {
      demo = gsap.timeline({ delay: 0.4 })
        .to(sim, { v: 100, duration: 2.2, ease: 'power2.inOut', onUpdate: () => setShade(sim.v) })
        .to(sim, { v: 25, duration: 1.6, ease: 'power2.inOut', onUpdate: () => setShade(sim.v) }, '+=0.5');
    }
  });
  const smile = $('.smile');
  let drag = null;
  smile.addEventListener('pointerdown', e => { stopDemo(); drag = { x: e.clientX, v: sim.v, w: smile.getBoundingClientRect().width }; smile.setPointerCapture(e.pointerId); });
  smile.addEventListener('pointermove', e => { if (drag) setShade(drag.v + ((e.clientX - drag.x) / drag.w) * 140); });
  const endDrag = () => (drag = null);
  smile.addEventListener('pointerup', endDrag); smile.addEventListener('pointercancel', endDrag);

  /* =========================================================
     JORNADA
     ========================================================= */
  gsap.to('.steps-line span', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 62%', end: 'bottom 62%', scrub: true } });
  $$('.step').forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 64%', onEnter: () => s.classList.add('is-on'), onLeaveBack: () => s.classList.remove('is-on') }));

  /* =========================================================
     ESPAÇO — foto que se revela e faz parallax com o scroll
     ========================================================= */
  gsap.fromTo('.space-media', { clipPath: 'inset(14% 10% 14% 10% round 36px)' }, {
    clipPath: 'inset(0% 0% 0% 0% round 36px)', ease: 'none',
    scrollTrigger: { trigger: '.space-media', start: 'top 95%', end: 'top 35%', scrub: true }
  });
  gsap.fromTo('.space-media img', { scale: 1.22, yPercent: -4 }, {
    scale: 1.02, yPercent: 4, ease: 'none',
    scrollTrigger: { trigger: '.space-media', start: 'top bottom', end: 'bottom top', scrub: 0.6 }
  });

  /* =========================================================
     REVELAÇÕES GENÉRICAS
     ========================================================= */
  words.forEach((ws, el) => {
    if (el.closest('.hero') || el.hasAttribute('data-scrub-words') || el.classList.contains('foot-word')) return;
    gsap.from(ws, { yPercent: 115, duration: 1.2, stagger: 0.035, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 86%' } });
  });
  gsap.from(words.get($('.foot-word')), { yPercent: 110, duration: 1.4, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.foot-word', start: 'top 92%' } });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out' })
  });

  /* ---------------- FAQ ---------------- */
  $$('.qa button').forEach(b => b.addEventListener('click', () => {
    const qa = b.parentElement, open = !qa.classList.contains('open');
    $$('.qa.open').forEach(o => { o.classList.remove('open'); $('button', o).setAttribute('aria-expanded', 'false'); });
    if (open) { qa.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
    setTimeout(() => ScrollTrigger.refresh(), 650);
  }));

  /* ---------------- formulário → WhatsApp ---------------- */
  const toast = $('.toast');
  const showToast = msg => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove('show'), 3200); };
  $('.form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, nome = f.nome.value.trim(), tel = f.tel.value.trim();
    let ok = true;
    [[f.nome, nome.length > 1], [f.tel, tel.replace(/\D/g, '').length >= 8]].forEach(([inp, valid]) => {
      const fld = inp.closest('.field'); fld.classList.remove('err');
      if (!valid) { ok = false; void fld.offsetWidth; fld.classList.add('err'); }
    });
    if (!ok) return showToast('Preencha seu nome e telefone, por favor.');
    const msg = `Olá! Meu nome é ${nome}. Tenho interesse em: ${f.interesse.value}. Prefiro atendimento no período da ${f.periodo.value}. Meu telefone: ${tel}.`;
    window.open(waBase + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    showToast('Abrindo o WhatsApp… até já! 😁');
  });

  /* ---------------- botões magnéticos ---------------- */
  if (!isTouch) {
    $$('.magnetic').forEach(el => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      const my = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3); my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  /* ---------------- cursor personalizado ---------------- */
  if (!isTouch) {
    document.documentElement.classList.add('has-cursor');
    const cur = $('.cursor'), label = $('.cursor-label');
    const dx = gsap.quickTo('.cursor-dot', 'x', { duration: 0.08 }), dy = gsap.quickTo('.cursor-dot', 'y', { duration: 0.08 });
    const rx = gsap.quickTo('.cursor-ring', 'x', { duration: 0.45, ease: 'power3.out' }), ry = gsap.quickTo('.cursor-ring', 'y', { duration: 0.45, ease: 'power3.out' });
    window.addEventListener('pointermove', e => { cur.classList.add('is-live'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener('pointerover', e => {
      const l = e.target.closest('[data-cursor]');
      const h = e.target.closest('a, button, input, label, .smile');
      cur.classList.toggle('is-label', !!l && !h?.matches('a, button'));
      cur.classList.toggle('is-hover', !!h);
      if (l) label.textContent = l.dataset.cursor;
    });
    document.documentElement.addEventListener('pointerleave', () => cur.classList.remove('is-hover', 'is-label', 'is-live'));
  }

  /* ---------------- ajustes finais ---------------- */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
