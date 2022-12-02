// export const destroy = () => {
//   const $testimonials_slick_slider = $('.testimonials-slick-slider');
//   $testimonials_slick_slider.slick('unslick');
// }

 const mobileSectionSlider = () => {
  const $mobile_section_slider = $('.mobile-section-slider');

   $mobile_section_slider.not('.slick-initialized').slick({
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    responsive: [
     {
      breakpoint: 1200,
      settings: {
       slidesToShow: 1,
       slidesToScroll: 1,
       infinite: true,
       dots: true
      }
     },
     {
      breakpoint: 992,
      settings: {
       slidesToShow: 1,
       slidesToScroll: 1
      }
     },
     {
      breakpoint: 768,
      settings: {
       slidesToShow: 1,
       slidesToScroll: 1
      }
     }
    ]
  });
}

mobileSectionSlider();