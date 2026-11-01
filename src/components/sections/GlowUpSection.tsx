import React, { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import './GlowUpSection.css';

const CH = 4;
const PAL = [
  ['#FFC4D8', '#E5427A'],
  ['#BDE8DC', '#12847A'],
  ['#CFC0FF', '#7A4FD6'],
  ['#FFD36B', '#C77700'],
];

function hexToRgb(h: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16)) as [number, number, number];
}

function noise(i: number, t: number) {
  return Math.sin(i * 1.7 + t * 1.3) * 0.5 + Math.sin(i * 0.63 - t * 0.9) * 0.5;
}

export const GlowUpSection: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const storyRef = useRef<HTMLElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const pcvCanvasRef = useRef<HTMLCanvasElement>(null);
  const rvRef = useRef<HTMLInputElement>(null);
  const dlRef = useRef<HTMLSpanElement>(null);
  const curRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const doneRef = useRef(false);
  const sliderValRef = useRef(0);

  const burst = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !rvRef.current) return;
    const r = rvRef.current.getBoundingClientRect();
    const x0 = r.right - 20;
    const y0 = r.top + r.height / 2;

    for (let i = 0; i < 18; i++) {
      const s = document.createElement('span');
      s.className = 'glowup-spark';
      s.textContent = i % 2 ? '✦' : '❀';
      s.style.left = x0 + 'px';
      s.style.top = y0 + 'px';
      document.body.appendChild(s);

      const a = Math.random() * Math.PI * 2;
      const d = 70 + Math.random() * 150;
      const anim = s.animate(
        [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          {
            transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d - 50}px) scale(.2) rotate(240deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 900 + Math.random() * 500,
          easing: 'cubic-bezier(.2,.8,.3,1)',
        }
      );
      anim.onfinish = () => s.remove();
    }
  }, []);

  const handleSliderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const frac = val / 100;
    sliderValRef.current = frac;
    e.target.style.setProperty('--v', val + '%');

    if (frac >= 0.97 && !doneRef.current) {
      doneRef.current = true;
      if (dlRef.current) dlRef.current.innerHTML = 'REVEALED ✦';
      burst();
    } else if (frac < 0.9 && doneRef.current) {
      doneRef.current = false;
      if (dlRef.current) dlRef.current.innerHTML = 'DRAG TO REVEAL <i class="chev">»</i>';
    }
  };

  const handleRailClick = (idx: number) => {
    const story = storyRef.current;
    if (!story) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = story.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: t + ((idx + 0.5) / CH) * (story.offsetHeight - window.innerHeight) * 0.98,
      behavior: calm ? 'auto' : 'smooth',
    });
  };

  useEffect(() => {
    const story = storyRef.current;
    const bg = bgCanvasRef.current;
    const pcv = pcvCanvasRef.current;
    const cu = curRef.current;
    const dt = dotRef.current;
    if (!story || !bg || !pcv) return;

    const bx = bg.getContext('2d', { alpha: false });
    const px = pcv.getContext('2d');
    if (!bx || !px) return;

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const off = document.createElement('canvas');
    const ox = off.getContext('2d');
    if (!ox) return;

    const img = new Image();
    img.src = '/images/model.png';

    let W = 0;
    let H = 0;
    let PW = 0;
    let PH = 0;
    // Cap DPR to 1.25 to prevent memory explosion on Retina/4K displays
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

    function size() {
      if (!bg || !pcv || !story) return;
      W = window.innerWidth;
      H = window.innerHeight;
      bg.width = Math.round(W * dpr);
      bg.height = Math.round(H * dpr);
      bx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      story.style.setProperty('--vh', H / 100 + 'px');
      const r = pcv.getBoundingClientRect();
      PW = Math.round(r.width * dpr);
      PH = Math.round(r.height * dpr);
      pcv.width = off.width = PW;
      pcv.height = off.height = PH;
    }

    size();
    window.addEventListener('resize', size, { passive: true });

    /* Split H1 into letter spans */
    const h1List = story.querySelectorAll('h1');
    h1List.forEach((h) => {
      const t = h.dataset.t || '';
      let n = 0;
      h.setAttribute('aria-label', t);
      h.innerHTML = t
        .split(' ')
        .map((w) => {
          return (
            '<span class="w" aria-hidden="true">' +
            w
              .split('')
              .map((c) => `<span class="l" style="--i:${n++}">${c}</span>`)
              .join('') +
            '</span>'
          );
        })
        .join('<span class="sp" aria-hidden="true"> </span>');
    });

    const chs = Array.from(story.querySelectorAll('.ch')) as HTMLElement[];
    const rails = Array.from(story.querySelectorAll('.rail button')) as HTMLElement[];
    const mobileDots = Array.from(story.querySelectorAll('.mobile-dot')) as HTMLElement[];

    /* State variables */
    let target = 0;
    let cur = 0;
    let mx = 0.5;
    let my = 0.5;
    let tmx = 0.5;
    let tmy = 0.5;
    let vel = 0;
    let amp = 0;
    let sv = 0;
    let lastS = window.scrollY;
    let rev = calm ? 1 : 0.05;
    let idx = 0;
    const col = hexToRgb(PAL[0][0]);

    let cx = -100;
    let cy = -100;
    let rx = -100;
    let ry = -100;
    let isVisible = true;
    let isInside = false;

    function readScroll() {
      if (!story) return;
      const t = story.offsetHeight - window.innerHeight;
      if (t <= 0) return;
      target = Math.min(1, Math.max(0, -story.getBoundingClientRect().top / t));
    }

    window.addEventListener('scroll', readScroll, { passive: true });
    readScroll();
    cur = target;

    // Use IntersectionObserver to completely halt rendering loop when section is scrolled out of view
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
      },
      { rootMargin: '100px 0px 100px 0px' }
    );
    observer.observe(story);

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      tmx = e.clientX / (W || 1);
      tmy = e.clientY / (H || 1);
      cx = e.clientX;
      cy = e.clientY;

      if (story) {
        const rect = story.getBoundingClientRect();
        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        if (inside !== isInside) {
          isInside = inside;
          if (cu) cu.style.display = inside ? 'grid' : 'none';
          if (dt) dt.style.display = inside ? 'block' : 'none';
          story.classList.toggle('glowup-cursor-hidden', inside);
        }
      }
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onPointerOver = (e: MouseEvent) => {
      if (!cu || !isInside) return;
      const targetEl = (e.target as Element)?.closest?.('[data-cur],#rv,.rail button,.pillb');
      if (targetEl) {
        cu.classList.add('big');
        cu.textContent = targetEl.id === 'rv' ? 'DRAG' : (targetEl as HTMLElement).dataset.cur || '';
      } else {
        cu.classList.remove('big');
        cu.textContent = '';
      }
    };
    document.addEventListener('pointerover', onPointerOver);

    let animId = 0;
    let lastFrameTime = 0;
    const FRAME_MIN_MS = 1000 / 60; // Max 60 FPS cap to avoid burning GPU on 120Hz/144Hz

    function frame(ts: number) {
      animId = requestAnimationFrame(frame);

      // Skip frame if not visible on screen or if throttled
      if (!isVisible) return;
      if (ts - lastFrameTime < FRAME_MIN_MS) return;
      lastFrameTime = ts;

      const t = ts / 1000;
      const s = window.scrollY;
      sv += (s - lastS - sv) * 0.15;
      lastS = s;

      cur += (target - cur) * (calm ? 1 : 0.08);

      const pmx = mx;
      mx += (tmx - mx) * 0.08;
      my += (tmy - my) * 0.08;
      vel += ((mx - pmx) * W - vel) * 0.2;

      const v = sliderValRef.current;
      const isDone = doneRef.current;
      if (!calm && !isDone) rev += (0.3 + 0.7 * v - rev) * 0.06;
      else rev += (1 - rev) * 0.08;

      amp += ((calm ? 0 : Math.min(30, Math.abs(vel) * 1.2 + Math.abs(sv) * 1.1 + (isDone ? 0 : 3))) - amp) * 0.1;

      const c = Math.min(CH - 1, Math.floor(cur * CH * 1.0 + 0.001));
      if (c !== idx) {
        idx = c;
        // Direct DOM update instead of React state re-render
        chs.forEach((e, i) => e.classList.toggle('on', i === c));
        rails.forEach((e, i) => e.classList.toggle('on', i === c));
        mobileDots.forEach((e, i) => e.classList.toggle('on', i === c));
        story?.style.setProperty('--acc', PAL[c][1]);
      }

      /* Wavy lines + dots */
      if (!story || !bx) return;
      const computed = getComputedStyle(story);
      const ink = computed.getPropertyValue('--ink-rgb').trim() || '74,18,54';
      const bgClr = computed.getPropertyValue('--bg').trim() || '#FFF1E6';

      bx.fillStyle = bgClr;
      bx.fillRect(0, 0, W, H);

      bx.lineWidth = 1;
      bx.strokeStyle = 'rgba(' + ink + ',.14)';
      const N = Math.round(H / 28);
      const px0 = mx * W;
      const py0 = my * H;

      for (let i = 0; i < N; i++) {
        bx.beginPath();
        const by = ((i + 0.5) * H) / N;
        for (let x = 0; x <= W + 24; x += 24) {
          let y =
            by +
            Math.sin(x * 0.004 + t * 0.5 + i * 0.22) * 16 +
            Math.sin(x * 0.011 - t * 0.35 + i * 0.5) * 7 +
            cur * 36 * Math.sin(i * 0.3 + x * 0.003);
          const dx = x - px0;
          const dy = by - py0;
          const g = Math.exp(-(dx * dx + dy * dy) / 52000);
          y += g * (dy > 0 ? 1 : -1) * 24;
          if (x === 0) bx.moveTo(x, y);
          else bx.lineTo(x, y);
        }
        bx.stroke();
      }

      bx.fillStyle = 'rgba(' + ink + ',.45)';
      for (let gx = 80; gx < W; gx += 200) {
        for (let gy = 70; gy < H; gy += 160) {
          bx.fillRect(gx, gy, 2, 2);
        }
      }

      /* Portrait: blob + model image on offscreen, then sheared slices */
      if (img.complete && PW && ox && px && pcv) {
        const tc = hexToRgb(PAL[c][0]);
        for (let k = 0; k < 3; k++) col[k] += (tc[k] - col[k]) * 0.07;
        ox.clearRect(0, 0, PW, PH);
        ox.fillStyle = `rgb(${col.map(Math.round).join(',')})`;
        ox.beginPath();
        for (let a = 0; a <= 40; a++) {
          const an = (a / 40) * Math.PI * 2;
          const r = 0.43 * PW * (1 + 0.07 * Math.sin(an * 3 + t * 0.8) + 0.05 * Math.sin(an * 5 - t * 0.6));
          const X = PW * 0.5 + Math.cos(an) * r;
          const Y = PH * 0.5 + Math.sin(an) * r * 1.02;
          if (a === 0) ox.moveTo(X, Y);
          else ox.lineTo(X, Y);
        }
        ox.fill();

        const ih = PH * 0.9;
        const iw = (ih * img.width) / (img.height || 1);
        ox.drawImage(img, (PW - iw) / 2, PH - ih, iw, ih);

        px.clearRect(0, 0, PW, PH);

        // When completely still (no velocity or scroll), draw directly without band slicing
        if (amp < 0.2 && Math.abs(vel) < 0.2 && isDone) {
          px.drawImage(off, 0, 0, PW, PH);
        } else {
          const band = Math.max(4, Math.round(PH / (60 + (idx % 2) * 24)));
          const nBands = Math.ceil(PH / band);
          const sx = Math.sign(vel) || 1;
          const f = 0.28 + 0.72 * Math.min(1, rev);

          for (let b = 0; b < nBands; b++) {
            const y0 = b * band;
            const sh = (noise(b, t) * amp * 0.85 + Math.sin(b * 0.3 + t * 2) * (calm ? 0 : 2)) * sx;
            px.drawImage(off, 0, y0, PW, band * f, sh * dpr, y0, PW, band * f);
          }
        }

        pcv.style.transform =
          (window.innerWidth > 820 ? '' : 'translateX(50%) ') +
          'translate(' +
          (mx - 0.5) * -20 +
          'px,' +
          (my - 0.5) * -10 +
          'px) rotate(' +
          (mx - 0.5) * 2 +
          'deg)';
      }

      /* Custom cursor */
      if (cu && dt && isInside) {
        rx += (cx - rx) * 0.18;
        ry += (cy - ry) * 0.18;
        cu.style.transform = `translate(${rx}px, ${ry}px)`;
        dt.style.transform = `translate(${cx}px, ${cy}px)`;
      }
    }

    animId = requestAnimationFrame(frame);
    story.style.setProperty('--acc', PAL[0][1]);
    chs[0]?.classList.add('on');
    rails[0]?.classList.add('on');
    mobileDots[0]?.classList.add('on');

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('resize', size);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerover', onPointerOver);
    };
  }, []);

  return (
    <div>
      <main
        className="story glowup-story"
        id="story"
        ref={storyRef}
        data-theme={theme === 'dark' ? 'night' : 'day'}
      >
        <div className="stage" id="stage">
          <canvas className="bg-canvas" id="bg" ref={bgCanvasRef} aria-hidden="true" />

          {/* HUD: Brand Logo & Top Actions */}
          <a className="logo" href="#">
            <i>🪷</i>
            <span>BLINDGLOW</span>
          </a>

          <div className="top">
            <button
              className="pillb"
              id="th"
              type="button"
              aria-pressed={theme === 'dark'}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? 'Day mode' : 'Night mode'}
            </button>
            <a className="pillb fill" href="#booking" data-cur="Book">
              Book now
            </a>
          </div>

          {/* Desktop side rail navigation */}
          <nav className="rail" id="rail" aria-label="Sections">
            {[0, 1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                className={num === 0 ? 'on' : ''}
                onClick={() => handleRailClick(num)}
              >
                0{num + 1}
              </button>
            ))}
          </nav>

          {/* Mobile chapter navigation dots */}
          <div className="mobile-dots" aria-label="Chapters">
            {[0, 1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                className={`mobile-dot ${num === 0 ? 'on' : ''}`}
                aria-label={`Chapter 0${num + 1}`}
                onClick={() => handleRailClick(num)}
              />
            ))}
          </div>

          {/* Portrait canvas */}
          <canvas
            className="pcv"
            id="pcv"
            ref={pcvCanvasRef}
            role="img"
            aria-label="Woman in a golden Rajasthani outfit with traditional jewellery"
          />

          {/* Chapters copy & headlines */}
          <div className="copy" id="copy">
            <section className="ch on" aria-label="Welcome">
              <div className="info">
                <b>WELCOME</b>
                <p>Hair, makeup and skin care by artists who listen first and style second.</p>
              </div>
              <h1 data-t="Glow up" />
            </section>

            <section className="ch" aria-label="Hair">
              <div className="info">
                <b>HAIR STUDIO</b>
                <p>Cuts, colour, smoothing and hair spa. Soft waves or a bold new start.</p>
              </div>
              <h1 data-t="Hair" />
            </section>

            <section className="ch" aria-label="Makeup">
              <div className="info">
                <b>MAKEUP STUDIO</b>
                <p>Bridal and party looks that stay fresh from the first photo to the last dance.</p>
              </div>
              <h1 data-t="Makeup" />
            </section>

            <section className="ch" aria-label="Skin">
              <div className="info">
                <b>SKIN &amp; GLOW</b>
                <p>Facials, threading, waxing and mehndi that leave you soft and radiant.</p>
              </div>
              <h1 data-t="Skin" />
            </section>
          </div>

          {/* Drag to reveal slider */}
          <label className="drag">
            <span id="dl" ref={dlRef}>
              DRAG TO REVEAL <i className="chev">»</i>
            </span>
            <input
              id="rv"
              ref={rvRef}
              type="range"
              min="0"
              max="100"
              defaultValue="0"
              aria-label="Drag to reveal the portrait"
              onChange={handleSliderInput}
              onInput={handleSliderInput}
            />
          </label>

          {/* Footer watermark */}
          <div className="foot">#GLOWUP &nbsp;/&nbsp; SCROLL</div>
        </div>
      </main>

      {/* Scoped custom cursor */}
      <div className="cur glowup-cur" id="cur" ref={curRef} />
      <div className="dot glowup-dot" id="dot" ref={dotRef} />
    </div>
  );
};

export default GlowUpSection;
