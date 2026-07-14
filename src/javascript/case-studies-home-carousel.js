import $ from 'jquery';

$(function () {
  const $track = $('.case-studies-home-track');
  if (!$track.length) return;

  const desktopMQ = window.matchMedia('(min-width: 992px)');
  // Below 1280px three slides are too narrow for the fixed-width titles —
  // drop to two so the title column never shrinks. Kept out of slick's
  // `responsive` option: its breakpoint handler races manual unslick on
  // resize (a debounced internal timer re-inits the destroyed instance
  // and empties the track).
  const wideMQ = window.matchMedia('(min-width: 1280px)');

  function sync() {
    const slicked = $track.hasClass('slick-initialized');

    if (!desktopMQ.matches) {
      // Hand the track back to the CSS scroll-snap layout on mobile.
      if (slicked) $track.slick('unslick');
      return;
    }

    const slidesToShow = wideMQ.matches ? 3 : 2;

    if (!slicked) {
      $track.slick({
        slidesToShow: slidesToShow,
        slidesToScroll: 1,
        infinite: true,
        arrows: true,
        // No autoplay: the lead case study should stay in view until the
        // visitor chooses to move on.
        autoplay: false,
        speed: 650,
        cssEase: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      });
    } else if ($track.slick('slickGetOption', 'slidesToShow') !== slidesToShow) {
      $track.slick('slickSetOption', 'slidesToShow', slidesToShow, true);
    }
  }

  sync();
  $(window).on('resize', sync);
});
