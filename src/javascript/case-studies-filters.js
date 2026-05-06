import $ from 'jquery';

$(function () {
  const $filters = $('.js-case-filter');
  const $cards = $('.js-case-card');

  if (!$filters.length || !$cards.length) {
    return;
  }

  // Assign a stable view-transition-name to each card so the browser can
  // animate each one independently (smooth position shifts, not jumps).
  $cards.each(function (i) {
    const slug = ($(this).attr('href') || '').split('/').pop() || `card-${i}`;
    this.style.viewTransitionName = `cs-card-${slug}`;
  });

  $filters.on('click', function () {
    const $button = $(this);
    const filter = $button.data('filter');

    $filters.removeClass('is-active').attr('aria-selected', 'false');
    $button.addClass('is-active').attr('aria-selected', 'true');

    const apply = () => {
      $cards.each(function () {
        const $card = $(this);
        const category = $card.data('category');
        const shouldShow = !filter || filter === 'all' || category === filter;
        $card.toggleClass('is-filtered-out', !shouldShow);
      });
    };

    if (document.startViewTransition) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  });
});

