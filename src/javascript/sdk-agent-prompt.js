// Homepage SDK agent card: the composer types its invitation when the
// card scrolls into view, and the button copies the full onboarding
// prompt (hidden in the DOM) with confirmation.

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
          setTimeout(step, 34 + Math.random() * 42);
        }
      };
      setTimeout(step, 450);
    });
  }, { threshold: 0.4 });

  observer.observe(card);
}

function init() {
  initTypewriter();

  const button = document.querySelector('[data-copy-prompt]');
  const prompt = document.querySelector('[data-agent-prompt]');
  if (!button || !prompt) return;

  const label = button.querySelector('span');
  let resetTimer;

  const fallbackCopy = (text) => {
    const scratch = document.createElement('textarea');
    scratch.value = text;
    scratch.setAttribute('readonly', '');
    scratch.style.position = 'fixed';
    scratch.style.opacity = '0';
    document.body.appendChild(scratch);
    scratch.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (e) {
      copied = false;
    }
    scratch.remove();
    return copied;
  };

  button.addEventListener('click', async () => {
    const text = prompt.textContent.trim();
    let copied = false;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (e) {
        copied = fallbackCopy(text);
      }
    } else {
      copied = fallbackCopy(text);
    }

    if (!copied) {
      // Last resort: select the prompt so a manual Cmd/Ctrl+C works.
      const range = document.createRange();
      range.selectNodeContents(prompt);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    button.classList.add('is-copied');
    if (label) label.textContent = 'Copied';
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      button.classList.remove('is-copied');
      if (label) label.textContent = 'Copy prompt';
    }, 2200);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
