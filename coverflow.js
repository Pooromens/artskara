// ---------- Coverflow carousel ----------
// Vanilla port of the CoverflowCarousel React component. Markup is authored in
// the HTML (cards + captions); this file only drives the rake and the settle.
// Must load before script.js so the lightbox and i18n see the captions.

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initCoverflow(root) {
    const num = (key, fallback) => {
      const value = parseFloat(root.dataset[key]);
      return Number.isFinite(value) ? value : fallback;
    };

    /** Degrees the first neighbour tilts. */
    const rotate = num('rotate', 44);
    /** How far the first neighbour recedes, as a fraction of card width. */
    const depth = num('depth', 0.6);
    /** Viewer distance as a multiple of card width — smaller is a wider lens. */
    const perspective = num('perspective', 3);
    /** Exponent on distance. Below 1 the rake eases off as cards travel out. */
    const falloff = num('falloff', 0.56);
    /** Opacity lost per step from the centre. */
    const fade = num('fade', 0.1);
    /** Space between cards, as a fraction of card width. */
    const gap = num('gap', 0.05);
    const loop = root.dataset.loop !== 'false';
    /** Cards per second the ring drifts on its own; 0 turns it off. */
    const autoplay = loop && !reduceMotion ? num('autoplay', 0.3) : 0;

    const frame = root.querySelector('.cf__frame');
    const cards = Array.from(root.querySelectorAll('.cf__card'));
    const captions = Array.from(root.querySelectorAll('.cf__caption'));
    const dotsWrap = root.querySelector('.cf__dots');
    const count = cards.length;
    if (!frame || !count) return;

    frame.style.perspective = `calc(var(--cf-card) * ${perspective})`;

    /** Fractional card index at the centre. The single source of truth. */
    let pos = 0;
    /** Where the current settle is headed, so a mid-flight keypress isn't swallowed. */
    let target = 0;
    let width = 0;
    let raf = null;
    let drag = null;
    let suppressClick = false;
    let selected = -1;

    /** Nearest whole card, folded back into 0..count-1. */
    const indexAt = (p) => ((Math.round(p) % count) + count) % count;
    const clamp = (p) => (loop ? p : Math.max(0, Math.min(count - 1, p)));

    const dots = [];
    if (dotsWrap) {
      cards.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'cf__dot';
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => goTo(index));
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function select(index) {
      if (index === selected) return;
      selected = index;
      cards.forEach((card, i) => {
        const active = i === index;
        card.classList.toggle('is-active', active);
        // Only the centre card is reachable by Tab; the rest are a click away.
        const img = card.querySelector('img');
        if (img) img.tabIndex = active ? 0 : -1;
      });
      captions.forEach((caption, i) => caption.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    }

    // Paint straight to the DOM, every frame, for every card.
    function paint() {
      if (!width) return;
      const pitch = width * (1 + gap);

      cards.forEach((card, index) => {
        // Fold the distance into the shorter way round the ring — the whole
        // looping mechanism, with no cloned nodes.
        let offset = index - pos;
        if (loop) {
          offset = ((offset % count) + count) % count;
          if (offset > count / 2) offset -= count;
        }

        const distance = Math.abs(offset);
        const ramp = Math.pow(distance, falloff);
        // Capped short of edge-on so a far card never turns its back.
        const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

        card.style.transform =
          `translateX(calc(-50% + ${offset * pitch}px)) ` +
          `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

        // A card jumps across the ring at half a turn out, so it must be gone by then.
        const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
        card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
        card.style.zIndex = String(100 - Math.round(distance));
      });
    }

    function settle(to) {
      if (raf !== null) cancelAnimationFrame(raf);
      target = to;
      select(indexAt(to));

      if (reduceMotion) {
        pos = to;
        paint();
        raf = null;
        return;
      }

      const step = () => {
        const remaining = to - pos;
        if (Math.abs(remaining) < 0.0004) {
          pos = to;
          paint();
          raf = null;
          return;
        }
        // Exponential ease-out, not a spring.
        pos += remaining * 0.16;
        paint();
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    function goTo(index) {
      // Take the shorter way round rather than unwinding the whole ring.
      const to = loop ? index + Math.round((target - index) / count) * count : index;
      settle(clamp(to));
    }

    const nudge = (by) => settle(clamp(Math.round(target) + by));

    // Pointer capture is deferred until the pointer actually travels, so a
    // plain tap still lands on the image and opens the lightbox.
    frame.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      drag = {
        id: event.pointerId,
        x: event.clientX,
        pos,
        v: 0,
        t: performance.now(),
        moved: false,
      };
    });

    frame.addEventListener('pointermove', (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x;

      if (!drag.moved) {
        if (Math.abs(dx) < 6) return;
        drag.moved = true;
        if (raf !== null) {
          cancelAnimationFrame(raf);
          raf = null;
        }
        drag.pos = pos;
        drag.x = event.clientX;
        target = pos;
        frame.setPointerCapture(event.pointerId);
        frame.classList.add('is-dragging');
        return;
      }

      const pitch = width * (1 + gap);
      if (!pitch) return;

      const now = performance.now();
      const previous = pos;
      pos = clamp(drag.pos - dx / pitch);
      // Cards per second, for the throw.
      drag.v = ((pos - previous) / Math.max(now - drag.t, 1)) * 1000;
      drag.t = now;

      select(indexAt(pos));
      paint();
    });

    function endDrag(event) {
      if (!drag || drag.id !== event.pointerId) return;
      const finished = drag;
      drag = null;
      frame.classList.remove('is-dragging');
      if (!finished.moved) return;

      suppressClick = true;
      setTimeout(() => (suppressClick = false), 0);
      // Let a flick carry, but never more than two cards.
      const carried = Math.max(-2, Math.min(2, finished.v * 0.18));
      settle(clamp(Math.round(pos + carried)));
    }

    frame.addEventListener('pointerup', endDrag);
    frame.addEventListener('pointercancel', endDrag);

    // Runs before the lightbox's own click handler: a drag never opens it, and
    // clicking a side card brings it to the centre instead.
    frame.addEventListener(
      'click',
      (event) => {
        if (suppressClick) {
          event.stopPropagation();
          event.preventDefault();
          return;
        }
        const card = event.target.closest('.cf__card');
        if (!card) return;
        const index = cards.indexOf(card);
        if (index !== selected) {
          event.stopPropagation();
          event.preventDefault();
          goTo(index);
        }
      },
      true
    );

    frame.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        nudge(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nudge(1);
      }
    });

    root.querySelector('.cf__nav--prev')?.addEventListener('click', () => nudge(-1));
    root.querySelector('.cf__nav--next')?.addEventListener('click', () => nudge(1));

    // Card width drives pitch and depth, so it is the only thing worth measuring.
    const measure = () => {
      width = cards[0].offsetWidth;
      paint();
    };
    new ResizeObserver(measure).observe(frame);

    // Auto-drift. Stops while the cursor is over the stage (settling on the
    // nearest card so it can be read), while focused, dragged, off-screen,
    // or behind the lightbox, and picks up again from wherever it was left.
    if (autoplay) {
      const stage = root.querySelector('.cf__stage') || frame;
      let hovered = false;
      let focused = false;
      let visible = true;
      let last = null;

      stage.addEventListener('pointerenter', (event) => {
        if (event.pointerType !== 'mouse') return;
        hovered = true;
        if (!drag && raf === null) settle(Math.round(pos));
      });
      stage.addEventListener('pointerleave', (event) => {
        if (event.pointerType === 'mouse') hovered = false;
      });
      // Keyboard focus only — a mouse click also focuses the frame.
      root.addEventListener('focusin', (event) => (focused = event.target.matches(':focus-visible')));
      root.addEventListener('focusout', () => (focused = false));
      new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(frame);

      const drift = (now) => {
        const paused =
          hovered ||
          focused ||
          !visible ||
          drag ||
          raf !== null ||
          document.hidden ||
          document.body.classList.contains('lightbox-open');

        if (!paused && last !== null) {
          // Clamp dt so a backgrounded tab doesn't jump several cards on return.
          pos += autoplay * Math.min((now - last) / 1000, 0.05);
          target = pos;
          select(indexAt(pos));
          paint();
        }
        last = now;
        requestAnimationFrame(drift);
      };
      requestAnimationFrame(drift);
    }

    select(0);
    measure();
    root.classList.add('is-ready');
  }

  document.querySelectorAll('[data-coverflow]').forEach(initCoverflow);
})();
