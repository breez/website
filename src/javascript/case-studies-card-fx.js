/**
 * Case-studies hub — cursor spotlight.
 * A soft radial glow follows the cursor across each `.cs-card`, driving the
 * `--mx` / `--my` custom props read by `.cs-spot`. Progressive enhancement,
 * gated to hover-capable fine pointers so touch devices are untouched.
 */
(function () {
  var cards = document.querySelectorAll('.cs-card');
  if (!cards.length) return;

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!finePointer) return;

  cards.forEach(function (card) {
    var raf = null;
    var mx = 50;
    var my = 0;

    card.addEventListener('pointermove', function (e) {
      var rect = card.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width) * 100;
      my = ((e.clientY - rect.top) / rect.height) * 100;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        card.style.setProperty('--mx', mx + '%');
        card.style.setProperty('--my', my + '%');
        raf = null;
      });
    });
  });
})();
