
const mobileFrameSlider = () => {
  const $mobile_frame_slider = $('.mobile-frame-slider');

  $mobile_frame_slider.not('.slick-initialized').slick({
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    dots: false,
    infinite: true,
    speed: 300,
    slidesToShow: 5,
    slidesToScroll: 1,

    centerMode: true,
    centerPadding: 0,

    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: false
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1.7,
          slidesToScroll: 1,
          variableWidth: false,
          adaptiveHeight: false,
          centerMode: false
        }
      }
    ]
  });
}

mobileFrameSlider();