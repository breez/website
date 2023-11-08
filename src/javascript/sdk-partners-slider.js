const sdkPartnersSlider = () => {
  const $sdk_partners_slider = $('.sdk-partners-slider');

   $sdk_partners_slider.not('.slick-initialized').slick({
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
         slidesToShow: 2,
        }
      },
      {
        breakpoint: 992,
        settings: {
         slidesToShow: 2,
        }
      },
      {
        breakpoint: 768,
        settings: {
         slidesToShow: 1,
        }
      },

    ]
  });
}

sdkPartnersSlider();