// Shared balance count-up: watch an element, and when it scrolls into
// view ease the value(s) from 0 to the target, formatted with thin-space
// thousands to match the markup's static 91&thinsp;375. No-op with
// reduced motion or without IntersectionObserver — the static value
// stands.
export function countUpBalance(observeEl, valueEls, { target = 91375, delay = 0, threshold = 0.4, duration = 1400 } = {}) {
  const values = Array.from(valueEls);
  if (!observeEl || !values.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || typeof IntersectionObserver === 'undefined') return;

  const format = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();

      setTimeout(() => {
        const startTime = performance.now();

        const step = (now) => {
          const t = Math.min(1, (now - startTime) / duration);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - t, 3);
          values.forEach((v) => { v.textContent = format(Math.round(eased * target)); });
          if (t < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
      }, delay);
    });
  }, { threshold });

  observer.observe(observeEl);
}
