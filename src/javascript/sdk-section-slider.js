const sdkSectionSlider = () => {
  const $sdk_section_slider = $('.sdk-section-slider');

   $sdk_section_slider.not('.slick-initialized').slick({
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 2,
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
      {
        breakpoint: 576,
        settings: {
         slidesToShow: 2,
        }
      },
    ]
  });
}

sdkSectionSlider();