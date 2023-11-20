const scrollToElement = () => {
  const hash = window.location.hash;

  // close burger menu on click contact us link at mobile header only at home page
  // $('.close-burger-mobile').on('click', function () {
  //   $('.navbar-toggler').attr("aria-expanded","false");
  //   $('.navbar-collapse').removeClass('show');
  //   $('.burger-slip').removeClass('open');
  // });

  // fix start position for scroll from other pages
  setTimeout(function () {
    scrollTo(hash);
  }, 200);

    $('.js-scroll-to').on('click', function () {
      setTimeout(() => {
        scrollTo($(this).attr('data-scroll-to'));
      }, 200);
    });
};

function scrollTo(selector) {
  const element = $(selector);
  const navHeight = $('.navbar').innerHeight();
  const transformMatrixNumberPattern = /-?\d+\.?\d+|\d+/g;
  let aosDistance = 0;
  if (element.css('transform') !== 'none') {
    aosDistance = Number(element.css('transform')?.match(transformMatrixNumberPattern)[5]);
  }

  if (element.length) {
    $('html, body').animate({ scrollTop: element.offset().top - navHeight - aosDistance }, 300);
  }
}

scrollToElement();