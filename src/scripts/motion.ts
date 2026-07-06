/**
 * The motion layer: Lenis smooth scroll + GSAP scenes.
 * Loaded dynamically by app.ts ONLY on the 'full' tier.
 * Everything registers inside one gsap.context so a single revert
 * cleans the page before view transitions.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

let lenis: Lenis | null = null;
let ctx: gsap.Context | null = null;
const tick = (time: number) => lenis?.raf(time * 1000);

const EASE = 'power3.out';

export function pauseScroll(paused: boolean) {
  if (!lenis) return;
  paused ? lenis.stop() : lenis.start();
}

/** Scroll that cooperates with Lenis when it owns the scroll. */
export function scrollToTarget(target: Element | number, offset = -90) {
  if (lenis) {
    lenis.scrollTo(target as HTMLElement | number, { offset, duration: 0.9 });
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' });
  } else {
    (target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function initMotion() {
  /* Smooth inertial scroll — keyboard & anchors keep working */
  lenis = new Lenis({
    autoRaf: false,
    duration: 1.05,
    anchors: { offset: -80 },
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  ctx = gsap.context(() => {
    heroScene();
    splitHeadings();
    parallax();
    stepsScene();
    meterScene();
    magnetic();
  });

  requestAnimationFrame(() => ScrollTrigger.refresh());
}

export function destroyMotion() {
  document.documentElement.classList.remove('gsap-hero');
  document.querySelectorAll('.is-scrolly').forEach((el) => el.classList.remove('is-scrolly'));
  ctx?.revert();
  ctx = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.ticker.remove(tick);
  lenis?.destroy();
  lenis = null;
}

/* ── Hero: the power-on moment ───────────────────────────────── */
function heroScene() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  document.documentElement.classList.add('gsap-hero');

  const title = hero.querySelector<HTMLElement>('[data-hero-title]');
  const media = hero.querySelector<HTMLElement>('[data-hero-media]');
  const glow = hero.querySelector<HTMLElement>('[data-hero-glow]');
  const stages = hero.querySelectorAll<HTMLElement>('[data-hero-stage]');

  // Take ownership of the CSS pre-state with inline styles (same tick
  // as the class flip — no paint in between, no flash). No clearProps:
  // the CSS resting state is hidden, so inline end-state must persist.
  gsap.set(stages, { opacity: 0, y: 26 });

  const tl = gsap.timeline({ defaults: { ease: EASE } });

  if (media) {
    tl.fromTo(
      media,
      { scale: 1.07, opacity: 0.65 },
      { scale: 1, opacity: 1, duration: 1.7, ease: 'power2.out' },
      0
    );
  }
  if (glow) {
    tl.fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'power1.inOut' }, 0.1);
  }
  if (title) {
    const split = new SplitText(title, { type: 'words,chars', charsClass: 'hero-char' });
    gsap.set(title, { opacity: 1 });
    tl.from(
      split.chars,
      {
        opacity: 0,
        yPercent: 55,
        duration: 0.7,
        stagger: { each: 0.016, from: 'start' },
      },
      0.18
    );
  }
  if (stages.length) {
    tl.to(stages, { opacity: 1, y: 0, duration: 0.8, stagger: 0.09 }, 0.55);
  }

  /* slow parallax drift of the hero media while scrolling away */
  if (media) {
    gsap.to(media, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }
}

/* ── Big statement headings: line mask reveals ───────────────── */
function splitHeadings() {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const split = new SplitText(el, { type: 'lines', linesClass: 'split-line', mask: 'lines' });
    gsap.set(el, { opacity: 1 });
    gsap.from(split.lines, {
      yPercent: 115,
      duration: 0.9,
      ease: EASE,
      stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
    });
  });
}

/* ── Gentle parallax planes ──────────────────────────────────── */
function parallax() {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = parseFloat(el.dataset.parallax || '-8');
    gsap.to(el, {
      yPercent: amount,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('[data-parallax-root]') || el.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

/* ── "How it works" progress line ────────────────────────────── */
function stepsScene() {
  const scene = document.querySelector<HTMLElement>('[data-scene="steps"]');
  if (!scene) return;
  const line = scene.querySelector<HTMLElement>('[data-steps-line]');
  if (!line) return;
  gsap.fromTo(
    line,
    { scaleY: 0 },
    {
      scaleY: 1,
      transformOrigin: 'top center',
      ease: 'none',
      scrollTrigger: { trigger: scene, start: 'top 60%', end: 'bottom 55%', scrub: 0.4 },
    }
  );
}

/* ── Net billing 2026: day self-use → evening battery → the bill ─ */
function meterScene() {
  const scene = document.querySelector<HTMLElement>('[data-scene="meter"]');
  if (!scene) return;
  const pinArea = scene.querySelector<HTMLElement>('[data-meter-pin]');
  if (!pinArea) return;

  const q = (s: string) => scene.querySelector<HTMLElement>(s);
  const digits = q('[data-meter-digits]');
  const sun = q('[data-meter-sun]');
  const batt = q('[data-meter-batt]');
  const out = q('[data-meter-out]');
  const inn = q('[data-meter-in]');
  const bill = q('[data-meter-bill]');
  const captions = scene.querySelectorAll<HTMLElement>('[data-meter-caption]');
  if (captions.length < 3) return;

  // scrolly mode on — CSS switches captions to stacked/crossfade layout
  scene.classList.add('is-scrolly');

  const state = { units: 640 };
  const render = () => {
    if (digits) digits.textContent = String(Math.round(state.units));
  };
  render();

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end: '+=230%',
      scrub: 0.5,
      pin: pinArea,
      anticipatePin: 1,
    },
    defaults: { ease: 'none' },
  });

  gsap.set([batt, inn, bill], { opacity: 0 });

  // Beat 1 — daytime self-use: sun up, exports trickle, units fall hard
  tl.fromTo(sun, { yPercent: 45, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.16 }, 0);
  tl.fromTo(captions[0], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.07 }, 0.02);
  tl.fromTo(out, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.1);
  tl.to(state, { units: 322, duration: 0.28, onUpdate: render }, 0.1);
  tl.to(captions[0], { opacity: 0, y: -14, duration: 0.05 }, 0.36);

  // Beat 2 — evening: sun sets, battery takes over, exports stop
  tl.to(sun, { yPercent: 55, opacity: 0.12, duration: 0.12 }, 0.42);
  tl.to(out, { opacity: 0, duration: 0.04 }, 0.42);
  tl.fromTo(captions[1], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.07 }, 0.46);
  tl.to(batt, { opacity: 1, duration: 0.06 }, 0.48);
  tl.to(inn, { opacity: 1, duration: 0.06 }, 0.5);
  tl.to(state, { units: 295, duration: 0.16, onUpdate: render }, 0.5);
  tl.to(captions[1], { opacity: 0, y: -14, duration: 0.05 }, 0.72);

  // Beat 3 — month end: flows rest, the bill chip lands
  tl.to(inn, { opacity: 0.25, duration: 0.05 }, 0.78);
  tl.fromTo(captions[2], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.08 }, 0.8);
  tl.fromTo(
    bill,
    { opacity: 0, y: 16, scale: 0.96 },
    { opacity: 1, y: 0, scale: 1, duration: 0.1, ease: 'power2.out' },
    0.84
  );
}

/* ── Magnetic primary buttons (pointer: fine only) ───────────── */
function magnetic() {
  if (!matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('.btn-gold, [data-magnetic]').forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
    const onMove = (e: PointerEvent) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.18);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.22);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };
    btn.addEventListener('pointermove', onMove);
    btn.addEventListener('pointerleave', onLeave);
  });
}
