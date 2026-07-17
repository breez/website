// Homepage / SDK-page agent card: the composer types its invitation when
// the card scrolls into view; a toggle picks an AI assistant and the action
// button opens it with the full onboarding prompt (hidden in the DOM)
// pre-filled in that assistant's chat.

// Each assistant's "open a new chat with this text" deep link.
const AGENT_PROVIDERS = {
  claude:  { label: 'Claude',  build: (q) => 'https://claude.ai/new?q=' + q },
  chatgpt: { label: 'ChatGPT', build: (q) => 'https://chatgpt.com/?q=' + q },
  gemini:  { label: 'Gemini',  build: (q) => 'https://aistudio.google.com/prompts/new_chat?prompt=' + q },
  grok:    { label: 'Grok',    build: (q) => 'https://x.com/i/grok?text=' + q },
};

// Types the composer line character by character on first reveal. The
// text ships in the markup, so no-JS and reduced-motion get it static.
function initTypewriter() {
  const target = document.querySelector('[data-agent-type]');
  const card = document.querySelector('.sdk-agent');
  if (!target || !card) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || typeof IntersectionObserver === 'undefined') return;

  const text = target.textContent.trim();
  target.textContent = '';

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();

      let index = 0;
      const step = () => {
        index += 1;
        target.textContent = text.slice(0, index);
        if (index < text.length) {
          setTimeout(step, 18 + Math.random() * 22);
        }
      };
      setTimeout(step, 250);
    });
  }, { threshold: 0.4 });

  observer.observe(card);
}

// Point each "Open with" button straight at its assistant, pre-filled with
// the onboarding prompt — one click, no intermediate selection step.
function initLauncher() {
  const promptEl = document.querySelector('[data-agent-prompt]');
  const links = Array.from(document.querySelectorAll('[data-provider]'));
  if (!promptEl || !links.length) return;

  const encoded = encodeURIComponent(promptEl.textContent.trim());
  links.forEach((link) => {
    const provider = AGENT_PROVIDERS[link.getAttribute('data-provider')];
    if (provider) link.href = provider.build(encoded);
  });
}

function init() {
  initTypewriter();
  initLauncher();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
