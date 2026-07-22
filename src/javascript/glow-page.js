// Glow product page (/playground):
// 1. Hero balance counts up to ₿91 375 when the phone scrolls into view.
// 2. Feature videos are facades — a poster and play badge until the phone
//    nears the viewport, then a muted looping youtube-nocookie embed is
//    injected. With reduced motion (or without IntersectionObserver) the
//    poster stays and a click starts the video instead.

function initBalance() {
  // The Glow UI card sits below the statement; count up when it enters.
  const card = document.querySelector('.glow-ui-card');
  const values = card ? card.querySelectorAll('.gw-balance__value') : [];
  if (!card || !values.length) return;

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
          const eased = 1 - Math.pow(1 - t, 3);
          values.forEach((v) => { v.textContent = format(Math.round(eased * target)); });
          if (t < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
      }, 400);
    });
  }, { threshold: 0.2 });

  observer.observe(card);
}

function loadVideo(facade, autoplay) {
  if (facade.classList.contains('is-loading')) return;
  facade.classList.add('is-loading');

  const id = facade.dataset.videoId;
  const params = new URLSearchParams({
    autoplay: '1',
    mute: autoplay ? '1' : '0',
    loop: '1',
    playlist: id,
    controls: '0',
    rel: '0',
    playsinline: '1',
    modestbranding: '1',
  });

  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?' + params;
  iframe.title = facade.getAttribute('aria-label') || 'Glow demo video';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  // Keep the poster on top until the player has loaded and had a beat
  // to render its first frame — no long black square while buffering.
  iframe.addEventListener('load', () => {
    setTimeout(() => facade.classList.add('is-playing'), 900);
  });
  facade.appendChild(iframe);
}

function initVideos() {
  const facades = document.querySelectorAll('.glow-video[data-video-id]');
  if (!facades.length) return;

  // Click always works — with sound, since it's user-initiated.
  facades.forEach((facade) => {
    facade.addEventListener('click', () => loadVideo(facade, false));
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || typeof IntersectionObserver === 'undefined') return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      loadVideo(entry.target, true);
    });
  }, { rootMargin: '0px 0px 25% 0px', threshold: 0.35 });

  facades.forEach((facade) => observer.observe(facade));
}

// The statement intro: played once when the title reaches mid-viewport.
// Words rise out of a blur one after another (per-word delays set here,
// consumed by the CSS transitions), then the key words ignite blue with
// a single glow pulse. Without JS or with reduced motion the statement
// stays in its default state: static and fully lit.
function initStatement() {
  const intro = document.querySelector('[data-glow-statement]');
  if (!intro) return;

  const statement = intro.querySelector('.sdk-statement');
  const words = Array.from(intro.querySelectorAll('.sdk-word'));
  if (!statement || !words.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || typeof IntersectionObserver === 'undefined') return;

  const STAGGER = 110;
  words.forEach((word, i) => word.style.setProperty('--w-delay', (i * STAGGER) + 'ms'));

  // Follow-on elements (sub, CTA, card) continue the same cascade the
  // words run on: each starts shortly after the LAST word begins, so
  // the block reads as one continuous motion. Waiting for the words to
  // fully settle first leaves a dead beat after the headline.
  const steps = Array.from(intro.querySelectorAll('[data-glow-step]'))
    .sort((a, b) => a.dataset.glowStep - b.dataset.glowStep);
  const lastWordStart = (words.length - 1) * STAGGER;
  steps.forEach((el, i) => el.style.setProperty('--step-delay', (lastWordStart + 200 + i * 130) + 'ms'));

  intro.classList.add('is-armed');

  // Trigger off the (short) headline, not the tall intro — a tall
  // element can exceed the viewport and never reach a high threshold.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      requestAnimationFrame(() => intro.classList.add('is-live'));
    });
  }, { threshold: 0.6 });

  observer.observe(statement);
}

function init() {
  initBalance();
  initVideos();
  initStatement();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
