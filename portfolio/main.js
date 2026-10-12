/* Natia Khitarishvili — portfolio interactions.
   Everything here is progressive: without JS (or with reduced motion) the page
   renders exactly like the Figma design, just static. */
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------- Rotating hero word ---------- */
  function initRotator() {
    const rotator = document.querySelector('.rotator');
    if (!rotator || reduceMotion.matches) return;
    const words = rotator.dataset.words.split(',');
    const first = rotator.querySelector('.rotator__word');
    const els = [first, ...words.slice(1).map(word => {
      const el = document.createElement('span');
      el.className = 'rotator__word';
      el.textContent = word;
      rotator.append(el);
      return el;
    })];
    let index = 0;

    // Fixed slot = widest word, so "that feel" never shifts.
    const size = () => {
      rotator.classList.remove('is-ready');
      rotator.style.width = '';
      const widest = Math.max(...els.map(el => {
        el.style.cssText = 'position:absolute;display:inline-block';
        const w = el.getBoundingClientRect().width;
        el.style.cssText = '';
        return w;
      }));
      rotator.style.width = `${Math.ceil(widest)}px`;
      rotator.classList.add('is-ready');
    };

    const next = () => {
      if (document.hidden) return;
      const leaving = els[index];
      index = (index + 1) % els.length;
      const entering = els[index];
      leaving.className = 'rotator__word is-leaving';
      entering.className = 'rotator__word';          // parked below the line
      void entering.offsetWidth;
      entering.className = 'rotator__word is-entering is-current';
      setTimeout(() => {
        if (leaving !== els[index]) leaving.className = 'rotator__word';
        entering.classList.remove('is-entering');
      }, 800);
    };

    document.fonts.ready.then(() => {
      size();
      addEventListener('resize', size);
      setTimeout(() => setInterval(next, 2800), 1400);
    });
  }

  /* ---------- Scroll reveals ---------- */
  function initReveals() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    items.forEach(el => io.observe(el));
  }

  /* ---------- Stacking project cards ---------- */
  function initStack() {
    const wrap = document.querySelector('.cards');
    if (!wrap) return;
    const cards = [...wrap.querySelectorAll('.card')];
    const EDGE = 24;   // breathing room above / below a stuck card
    const GAP = 32;    // gap between cards in the layout
    let sticks = [];
    let ticking = false;

    // A card sticks 24px from the top, or, if it's taller than the screen,
    // once its bottom is 24px from the bottom so nothing is ever hidden.
    const measure = () => {
      sticks = cards.map(card => {
        const top = Math.min(EDGE, innerHeight - card.offsetHeight - EDGE);
        card.style.setProperty('--stick', `${top}px`);
        return top;
      });
      update();
    };

    // How far the next card has slid over this one: 0 → 1
    const update = () => {
      ticking = false;
      for (let i = 0; i < cards.length - 1; i++) {
        const start = sticks[i] + cards[i].offsetHeight + GAP;
        const end = sticks[i + 1];
        const top = cards[i + 1].getBoundingClientRect().top;
        const p = clamp((start - top) / (start - end), 0, 1);
        cards[i].style.setProperty('--p', p.toFixed(3));
      }
    };

    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };

    const enable = () => {
      if (reduceMotion.matches) {
        wrap.classList.remove('is-stacking');
        cards.forEach(c => c.style.removeProperty('--p'));
        return;
      }
      wrap.classList.add('is-stacking');
      measure();
    };

    enable();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', measure);
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(wrap);
    reduceMotion.addEventListener?.('change', enable);
  }

  /* ---------- Sparkles: click / tap for a small burst ---------- */
  function burst(sparkle) {
    if (reduceMotion.matches) return;
    const color = getComputedStyle(sparkle).getPropertyValue('--spark').trim() || '#ff9fda';
    const r = sparkle.getBoundingClientRect();
    const cx = r.left + r.width / 2 - 9;
    const cy = r.top + r.height / 2 - 9;
    const count = 9;
    for (let n = 0; n < count; n++) {
      const p = document.createElement('span');
      p.className = 'spark-particle';
      p.style.background = color;
      document.body.append(p);
      const angle = (n / count) * Math.PI * 2 + Math.random() * 0.6;
      const dist = 44 + Math.random() * 46;
      const scale = 0.45 + Math.random() * 0.75;
      const tx = cx + Math.cos(angle) * dist, ty = cy + Math.sin(angle) * dist;
      p.animate([
        { transform: `translate(${cx}px, ${cy}px) scale(0) rotate(0deg)`, opacity: 1, easing: 'cubic-bezier(.22, 1, .36, 1)' },
        { transform: `translate(${cx + (tx - cx) * .85}px, ${cy + (ty - cy) * .85}px) scale(${scale}) rotate(90deg)`, opacity: 1, offset: .55 },
        { transform: `translate(${tx}px, ${ty}px) scale(${scale * .5}) rotate(${150 + Math.random() * 90}deg)`, opacity: 0 },
      ], { duration: 750 + Math.random() * 300 })
        .onfinish = () => p.remove();
    }
  }
  function initSparkles() {
    document.querySelectorAll('.sparkle').forEach(s => s.addEventListener('click', () => burst(s)));
  }

  /* ---------- Portrait tilt ---------- */
  function initTilt() {
    const portrait = document.querySelector('.portrait');
    if (!portrait || !finePointer.matches || reduceMotion.matches) return;
    portrait.classList.add('tilt-ready');
    portrait.addEventListener('pointermove', e => {
      const r = portrait.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      portrait.classList.add('is-tilting');
      portrait.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
      portrait.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`);
    });
    portrait.addEventListener('pointerleave', () => {
      portrait.classList.remove('is-tilting');
      portrait.style.setProperty('--rx', '0deg');
      portrait.style.setProperty('--ry', '0deg');
    });
  }

  initRotator();
  initReveals();
  initStack();
  initSparkles();
  initTilt();
})();
