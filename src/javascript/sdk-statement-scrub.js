// Homepage SDK statement: words light up as the reader scrolls through
// the section; the three key claims underline once all their words are
// lit. Without JS (or with reduced motion) the CSS default is the fully
// lit state, so nothing is ever left unreadable.

function init() {
  const statement = document.querySelector('[data-sdk-statement]');
  if (!statement) return;

  const words = Array.from(statement.querySelectorAll('.sdk-word'));
  if (!words.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) return;

  const keys = Array.from(statement.querySelectorAll('.sdk-key')).map((el) => ({
    el,
    words: Array.from(el.querySelectorAll('.sdk-word')),
  }));

  statement.classList.add('--scrub');

  let ticking = false;
  let lastCount = -1;

  const update = () => {
    ticking = false;
    const rect = statement.getBoundingClientRect();
    const vh = window.innerHeight;
    // Progress runs from "statement top enters the viewport" to
    // "statement bottom crosses 65%" — the sentence (and the blue
    // highlights) finish while the statement is still front and centre,
    // never after the reader has scrolled past it.
    const start = vh;
    const end = vh * 0.65;
    const total = rect.height + (start - end);
    const progress = Math.min(1, Math.max(0, (start - rect.top) / total));
    const count = Math.round(progress * words.length);

    if (count === lastCount) return;
    lastCount = count;

    words.forEach((word, i) => word.classList.toggle('on', i < count));
    keys.forEach((key) => {
      key.el.classList.toggle('is-lit', key.words.every((w) => w.classList.contains('on')));
    });
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

init();
