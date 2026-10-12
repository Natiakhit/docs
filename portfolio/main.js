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

  /* ---------- Live product cards ----------
     Each .stage holds a design-size canvas scaled to its slot. Scripted
     scenes only advance while their card is on screen. */
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  function moveCursor(cursor, x, y, dur = 800) {
    // (x, y) is where the pointer's tip should land
    const size = cursor.querySelector('.ptr').getBoundingClientRect().width / (cursor.closest('.stage').style.getPropertyValue('--s') || 1);
    cursor.style.setProperty('--dur', `${dur}ms`);
    cursor.style.setProperty('--x', `${x - size * 0.17}px`);
    cursor.style.setProperty('--y', `${y - size * 0.1}px`);
  }
  async function clickCursor(cursor) {
    cursor.classList.add('is-click');
    await sleep(140);
    cursor.classList.remove('is-click');
  }

  const scenes = {
    async terminal({ el, wait }) {
      const lines = [...el.querySelectorAll('.tl')];
      const typed = el.querySelector('.tl__typed');
      typed.dataset.text ??= typed.textContent;
      el.classList.remove('is-fading');
      el.classList.add('is-playing');
      lines.forEach(line => line.classList.remove('is-on', 'is-late'));
      typed.textContent = '';
      lines[0].classList.add('is-on');
      await wait(600);
      for (const ch of typed.dataset.text) {
        typed.textContent += ch;
        await wait(30 + Math.random() * 45);
      }
      for (const line of lines.slice(1)) {
        await wait(+line.dataset.d || 300);
        line.classList.add('is-on');
        if (line.querySelector('.late')) {
          await wait(320);
          line.classList.add('is-late');
        }
      }
      await wait(4500);
      el.classList.add('is-fading');
      await wait(450);
    },

    async 'ai-prompt'({ el, wait }) {
      const out = el.querySelector('.ai__typed');
      for (const prompt of el.dataset.prompts.split('|')) {
        el.classList.add('is-empty');
        el.classList.remove('has-text');
        out.textContent = '';
        await wait(1000);
        el.classList.remove('is-empty');
        el.classList.add('has-text');
        for (const ch of prompt) {
          out.textContent += ch;
          await wait(40 + Math.random() * 50);
        }
        await wait(1800);
        while (out.textContent) {
          out.textContent = out.textContent.slice(0, -1);
          await wait(14);
        }
      }
    },

    async review({ el, wait }) {
      const cursor = el.querySelector('.cursor');
      el.classList.add('is-live');
      el.classList.remove('approved', 'btn-press', 'row-on');
      moveCursor(cursor, 640, 150, 0);
      await wait(700);
      for (const [i, y] of [274, 336, 429].entries()) {
        moveCursor(cursor, 290 + i * 40, y + 4, i ? 650 : 950);
        await wait(i ? 650 : 950);
        el.style.setProperty('--ry', `${y - 15}px`);
        el.classList.add('row-on');
        await wait(700);
      }
      el.classList.remove('row-on');
      moveCursor(cursor, 866, 24, 1000);
      await wait(1100);
      await clickCursor(cursor);
      el.classList.add('btn-press');
      await wait(220);
      el.classList.remove('btn-press');
      await wait(380);
      el.classList.add('approved');
      await wait(2800);
      moveCursor(cursor, 640, 150, 900);
      await wait(500);
      el.classList.remove('approved');
      await wait(600);
    },

    async comments({ el, wait }) {
      const cursor = el.querySelector('.cursor');
      const count = el.querySelector('.cm__n');
      const typed = el.querySelector('.cm__typed');
      el.classList.remove('sent', 'reacted', 'is-typing');
      count.textContent = '2';
      typed.textContent = '';
      await wait(900);
      moveCursor(cursor, 205, 225, 950);              // to the reaction
      await wait(1050);
      await clickCursor(cursor);
      count.textContent = '3';
      el.classList.add('reacted');
      await wait(320);
      el.classList.remove('reacted');
      await wait(650);
      moveCursor(cursor, 440, 512, 900);              // into the reply box
      await wait(1000);
      await clickCursor(cursor);
      el.classList.add('is-typing');
      await wait(350);
      for (const ch of 'Great, thanks!') {
        typed.textContent += ch;
        await wait(55 + Math.random() * 55);
      }
      await wait(600);
      typed.textContent = '';
      el.classList.remove('is-typing');
      el.classList.add('sent');                       // reply joins the thread
      moveCursor(cursor, 780, 330, 1100);
      await wait(3200);
      el.classList.remove('sent');
      moveCursor(cursor, 562, 215, 900);
      await wait(1000);
    },
  };

  function runScene(el, scene) {
    let visible = false;
    let waiting = [];
    const gate = () => (visible ? Promise.resolve() : new Promise(resolve => waiting.push(resolve)));
    const wait = async ms => { await sleep(ms); await gate(); };
    (async () => {
      await gate();
      for (;;) await scene({ el, wait });
    })();
    return {
      pause() { visible = false; },
      resume() { visible = true; waiting.splice(0).forEach(resolve => resolve()); },
    };
  }

  function initStages() {
    const stages = [...document.querySelectorAll('.stage')];
    if (!stages.length) return;
    const fit = stage => stage.style.setProperty('--s', (stage.clientWidth / +stage.dataset.w).toFixed(5));
    stages.forEach(stage => {
      const canvas = stage.querySelector('.stage__canvas');
      canvas.style.setProperty('--w', stage.dataset.w);
      canvas.style.setProperty('--h', stage.dataset.h);
      fit(stage);
      const el = stage.querySelector('[data-anim]');
      const scene = el && scenes[el.dataset.anim];
      if (scene && !reduceMotion.matches) stage._scene = runScene(el, scene);
    });
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(entries => entries.forEach(entry => fit(entry.target)));
      stages.forEach(stage => ro.observe(stage));
    }
    const show = (stage, on) => {
      stage.classList.toggle('is-visible', on);
      if (stage._scene) on ? stage._scene.resume() : stage._scene.pause();
    };
    if (!('IntersectionObserver' in window)) { stages.forEach(stage => show(stage, true)); return; }
    const io = new IntersectionObserver(entries => entries.forEach(e => show(e.target, e.isIntersecting)), { threshold: 0.2 });
    stages.forEach(stage => io.observe(stage));
  }

  /* ---------- Polaroid develops when it scrolls into view ---------- */
  function initPolaroid() {
    const polaroid = document.querySelector('.polaroid');
    if (!polaroid) return;
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      polaroid.classList.add('is-developed');
      return;
    }
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      setTimeout(() => polaroid.classList.add('is-developed'), 350);
      io.disconnect();
    }, { threshold: 0.3 });
    io.observe(polaroid);
  }

  initRotator();
  initStages();
  initPolaroid();
  initReveals();
  initStack();
  initSparkles();
  initTilt();
})();
