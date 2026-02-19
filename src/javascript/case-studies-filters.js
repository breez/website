import $ from 'jquery';

$(function () {
  const $filters = $('.js-case-filter');
  const $cards = $('.js-case-card');

  if (!$filters.length || !$cards.length) {
    return;
  }

  $filters.on('click', function () {
    const $button = $(this);
    const filter = $button.data('filter');

    $filters.removeClass('is-active');
    $button.addClass('is-active');

    if (!filter || filter === 'all') {
      $cards.removeClass('d-none');
      return;
    }

    $cards.each(function () {
      const $card = $(this);
      const category = $card.data('category');
      const shouldHide = category !== filter;

      $card.toggleClass('d-none', shouldHide);
    });
  });
});

