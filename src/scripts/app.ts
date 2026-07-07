/**
 * Client boot. Runs on first load and after every view transition.
 * Heavy motion (GSAP + Lenis) lives in motion.ts and is loaded only
 * on capable devices — everything here must stay cheap.
 */

type Tier = 'off' | 'lite' | 'full';

declare global {
  interface Window {
    __RSS?: { waE164: string; waLive: boolean; analytics: boolean };
    plausible?: (name: string, opts?: { props?: Record<string, unknown> }) => void;
  }
}

let cleanups: Array<() => void> = [];
let motionMod: typeof import('./motion') | null = null;

/* ── Motion tier ─────────────────────────────────────────────── */
function detectTier(): Tier {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'off';
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const weak =
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
    nav.connection?.saveData === true ||
    /(^|\D)2g/.test(nav.connection?.effectiveType ?? '') ||
    (navigator.hardwareConcurrency || 8) <= 3;
  return weak ? 'lite' : 'full';
}

/* ── Analytics ───────────────────────────────────────────────── */
export function track(name: string, props: Record<string, unknown> = {}) {
  if (window.__RSS?.analytics && typeof window.plausible === 'function') {
    window.plausible(name, { props });
  } else if (import.meta.env.DEV) {
    console.debug('[evt]', name, props);
  }
}

/** Smooth-scroll helper that stays correct whether or not Lenis runs. */
export function scrollToEl(target: Element | number, offset = -90) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motionMod) {
    motionMod.scrollToTarget(target, offset);
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
  } else {
    (target as HTMLElement).scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    });
  }
}

function bindTracking() {
  const onClick = (e: MouseEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-evt]');
    if (!el) return;
    const props: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(el.dataset)) {
      if (k.startsWith('evt') && k !== 'evt') {
        props[k.slice(3).toLowerCase()] = v;
      }
    }
    props.path = location.pathname;
    track(el.dataset.evt!, props);
  };
  document.addEventListener('click', onClick, { passive: true });
  cleanups.push(() => document.removeEventListener('click', onClick));
}

/* ── Reveal engine (CSS transitions + IO) ────────────────────── */
function bindReveals() {
  const singles = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.in)');
  const groups = document.querySelectorAll<HTMLElement>('[data-reveal-group]:not(.in)');
  if (!singles.length && !groups.length) return;

  groups.forEach((g) => {
    g.querySelectorAll<HTMLElement>('[data-reveal-child]').forEach((c, i) => {
      c.style.setProperty('--reveal-delay', `${Math.min(i * 90, 540)}ms`);
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          (en.target as HTMLElement).classList.add('in');
          io.unobserve(en.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
  );
  singles.forEach((el) => io.observe(el));
  groups.forEach((el) => io.observe(el));
  cleanups.push(() => io.disconnect());
}

/* ── Animated counters ───────────────────────────────────────── */
function bindCounters() {
  const els = document.querySelectorAll<HTMLElement>('[data-count-to]');
  if (!els.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animate = (el: HTMLElement) => {
    const to = parseFloat(el.dataset.countTo || '0');
    const dur = parseFloat(el.dataset.countDur || '1400');
    const dec = parseInt(el.dataset.countDecimals || '0', 10);
    const fmt = (n: number) =>
      n.toLocaleString('en-PK', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (reduce) {
      el.textContent = fmt(to);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          animate(en.target as HTMLElement);
          io.unobserve(en.target);
        }
      }
    },
    { threshold: 0.4 }
  );
  els.forEach((el) => io.observe(el));
  cleanups.push(() => io.disconnect());
}

/* ── Rotating headline word ──────────────────────────────────── */
function bindRotator() {
  const rotator = document.querySelector<HTMLElement>('[data-rotator]');
  if (!rotator) return;
  const words = Array.from(rotator.querySelectorAll<HTMLElement>('.rot-word'));
  if (words.length < 2) return;
  // Reduced motion: leave the shipped is-on word in place, don't cycle.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let i = 0;
  const id = window.setInterval(() => {
    const prev = words[i];
    prev.classList.remove('is-on');
    prev.classList.add('is-off'); // slides up and out
    i = (i + 1) % words.length;
    words[i].classList.add('is-on'); // rises into place
    window.setTimeout(() => prev.classList.remove('is-off'), 550);
  }, 2600);

  cleanups.push(() => window.clearInterval(id));
}

/* ── Nav state ───────────────────────────────────────────────── */
function bindNav() {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;
  const isHero = nav.classList.contains('nav-hero');
  if (!isHero) nav.classList.add('nav-solid');

  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;height:72px;width:1px;pointer-events:none;';
  document.body.prepend(sentinel);
  const io = new IntersectionObserver(
    ([en]) => {
      const scrolled = !en.isIntersecting;
      nav.classList.toggle('nav-tight', scrolled);
      if (isHero) nav.classList.toggle('nav-solid', scrolled);
    },
    { threshold: 0 }
  );
  io.observe(sentinel);
  cleanups.push(() => {
    io.disconnect();
    sentinel.remove();
  });
}

/* ── Menu sheet ──────────────────────────────────────────────── */
function bindMenu() {
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const openBtn = document.querySelector<HTMLElement>('[data-menu-open]');
  if (!menu || !openBtn) return;

  let lastFocus: HTMLElement | null = null;

  const setOpen = (open: boolean) => {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    openBtn.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('menu-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    motionMod?.pauseScroll(open);
    if (open) {
      lastFocus = document.activeElement as HTMLElement;
      menu.querySelector<HTMLElement>('[data-menu-close]')?.focus();
    } else {
      lastFocus?.focus();
    }
  };

  const onOpen = () => setOpen(true);
  const onKey = (e: KeyboardEvent) => {
    if (!menu.classList.contains('open')) return;
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'Tab') {
      const focusables = menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  const onMenuClick = (e: MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-menu-close]') || t.closest('a[href]')) setOpen(false);
  };

  openBtn.addEventListener('click', onOpen);
  menu.addEventListener('click', onMenuClick);
  document.addEventListener('keydown', onKey);
  cleanups.push(() => {
    openBtn.removeEventListener('click', onOpen);
    menu.removeEventListener('click', onMenuClick);
    document.removeEventListener('keydown', onKey);
    document.documentElement.style.overflow = '';
    document.documentElement.classList.remove('menu-open');
  });
}

/* ── Theme toggle ────────────────────────────────────────────── */
function bindTheme() {
  const apply = (t: string) => {
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem('rss-theme', t);
    } catch {}
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', t === 'day' ? '#faf6ec' : '#0a0f1e');
    track('theme_toggle', { theme: t });
  };
  const onClick = (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest('[data-theme-toggle]')) return;
    apply(document.documentElement.dataset.theme === 'day' ? 'dusk' : 'day');
  };
  document.addEventListener('click', onClick);
  cleanups.push(() => document.removeEventListener('click', onClick));
}

/* ── Boot / teardown ─────────────────────────────────────────── */
async function boot() {
  const tier = detectTier();
  document.documentElement.dataset.motion = tier;

  bindTracking();
  bindReveals();
  bindCounters();
  bindRotator();
  bindNav();
  bindMenu();
  bindTheme();

  if (tier === 'full') {
    try {
      motionMod = await import('./motion');
      motionMod.initMotion();
    } catch (err) {
      // Motion is an enhancement — the site must never depend on it.
      console.warn('motion failed to load', err);
      document.documentElement.dataset.motion = 'lite';
    }
  }
}

function teardown() {
  motionMod?.destroyMotion();
  cleanups.forEach((fn) => fn());
  cleanups = [];
}

document.addEventListener('astro:page-load', boot);
document.addEventListener('astro:before-swap', teardown);
