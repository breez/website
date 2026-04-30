import $ from 'jquery';

$(function () {
  const $track = $('.case-studies-home-track');
  if (!$track.length) return;

  const desktopMQ = window.matchMedia('(min-width: 992px)');

  function initSlick() {
    if (desktopMQ.matches) {
      if (!$track.hasClass('slick-initialized')) {
        $track.slick({
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          arrows: true,
          autoplay: false,
          speed: 500,
          cssEase: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        });
      }
    } else if ($track.hasClass('slick-initialized')) {
      $track.slick('unslick');
    }
  }

  initSlick();
  $(window).on('resize', initSlick);
});
