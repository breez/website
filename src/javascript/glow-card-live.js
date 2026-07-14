// Homepage Glow App card: the balance counts up to ₿91 375 when the card
// scrolls into view, timed to land as the balance block finishes its
// reveal. Without JS or with reduced motion the markup's static value
// stands.

function init() {
  const value = document.querySelector('.playground-home-card .gw-balance__value');
  if (!value) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || typeof IntersectionObserver === 'undefined') return;

  const target = 91375;
  // Thin-space thousands, matching the markup's 91&thinsp;375
  const format = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();

      setTimeout(() => {
        const startTime = performance.now();
        const duration = 1400;

        const step = (now) => {
          const t = Math.min(1, (now - startTime) / duration);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - t, 3);
          value.textContent = format(Math.round(eased * target));
          if (t < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
      }, 500);
    });
  }, { threshold: 0.4 });

  observer.observe(value);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
