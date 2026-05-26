const PHRASES_DESKTOP = [
  'Every App',
  'Neobanks',
  'Crypto Wallets',
  'Remittances',
  'Swaps & Bridges',
  'Exchanges',
  'Social Apps',
];

// "Crypto Wallets" and "Swaps & Bridges" don't fit comfortably under a
// 60px headline on a 360-390px viewport. Drop a shortened set on mobile.
const PHRASES_MOBILE = [
  'Every App',
  'Neobanks',
  'Wallets',
  'Remittances',
  'Swaps',
  'Bridges',
  'Exchanges',
  'Social Apps',
];

const MOBILE_BREAKPOINT = 768;
const mobileMQ = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

// Mutable so we can swap if the viewport crosses the breakpoint while the
// page is open (devtools resize, rotating a tablet, etc).
let PHRASES = mobileMQ.matches ? PHRASES_MOBILE : PHRASES_DESKTOP;

mobileMQ.addEventListener('change', (e) => {
  PHRASES = e.matches ? PHRASES_MOBILE : PHRASES_DESKTOP;
});

const TYPE_MIN = 75;
const TYPE_MAX = 115;
const ERASE_MS = 55;
const HOLD_FULL_BASE_MS = 1900;
const HOLD_FULL_PER_CHAR_MS = 75;
const HOLD_EMPTY_MS = 620;
const INITIAL_HOLD_MS = 3000;
const PUNCT_PAUSE_MS = 140;
const PUNCT_RE = /[&,.;:!?]/;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randTypeDelay = () => TYPE_MIN + Math.random() * (TYPE_MAX - TYPE_MIN);

// When the tab is hidden, setTimeout throttles and the animation drifts mid-word.
// Wait until visible before each step so the user always returns to a clean state.
function whenVisible() {
  if (!document.hidden) return Promise.resolve();
  return new Promise((resolve) => {
    const onChange = () => {
      if (!document.hidden) {
        document.removeEventListener('visibilitychange', onChange);
        resolve();
      }
    };
    document.addEventListener('visibilitychange', onChange);
  });
}

const wait = async (ms) => {
  await whenVisible();
  await sleep(ms);
};

async function runTypewriter(container, textEl) {
  let index = 0;

  await wait(INITIAL_HOLD_MS);

  while (true) {
    const current = PHRASES[index];
    const next = PHRASES[(index + 1) % PHRASES.length];

    container.classList.add('is-active');
    for (let i = current.length; i >= 0; i--) {
      textEl.textContent = current.slice(0, i);
      await wait(ERASE_MS);
    }
    container.classList.remove('is-active');

    await wait(HOLD_EMPTY_MS);

    container.classList.add('is-active');
    for (let i = 1; i <= next.length; i++) {
      textEl.textContent = next.slice(0, i);
      await wait(randTypeDelay());
      if (PUNCT_RE.test(next[i - 1])) await sleep(PUNCT_PAUSE_MS);
    }
    container.classList.remove('is-active');

    index = (index + 1) % PHRASES.length;
    await wait(HOLD_FULL_BASE_MS + next.length * HOLD_FULL_PER_CHAR_MS);
  }
}

function init() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const containers = document.querySelectorAll('[data-hero-typewriter]');
  containers.forEach((container) => {
    const textEl = container.querySelector('.hero-typewriter-text');
    if (!textEl) return;
    runTypewriter(container, textEl);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
