
const mobileFrameSlider = () => {
  const $mobile_frame_slider = $('.mobile-frame-slider');

  $mobile_frame_slider.not('.slick-initialized').slick({
    autoplay: false,
    // autoplaySpeed: 1000,
    autoplaySpeed: 8000,
    arrows: false,
    dots: false,
    infinite: true,
    speed: 300,
    slidesToShow: 5,
    slidesToScroll: 1,

    centerMode: true,
    centerPadding: 0,


    // centerMode: true,
    // variableWidth: true,




    // slidesToShow: 1,
    // slidesToScroll: 1,
    // autoplay: true,
    // autoplaySpeed: 3000,
    // centerMode: true,
    // arrows: false,
    // variableWidth: true,
    // dots: false,
    // cssEase: "none",

    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true
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
          // slidesToShow: 1.7,
          slidesToShow: 1.7,
          slidesToScroll: 1,
          variableWidth: false,
          adaptiveHeight: false,
          centerMode: false

        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  });
}

mobileFrameSlider();