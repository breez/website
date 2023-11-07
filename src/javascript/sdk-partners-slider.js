const sdkPartnersSlider = () => {
  const $sdk_partners_slider = $('.sdk-partners-slider');

   $sdk_partners_slider.not('.slick-initialized').slick({
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 992,
        settings: {
         slidesToShow: 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
         slidesToShow: 2,
        }
      },
    ]
  });
}

sdkPartnersSlider();