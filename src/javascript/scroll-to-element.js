const scrollToElement = () => {
  const hash = window.location.hash;

  // fix start position for scroll from other pages
  setTimeout(function (){
    scrollTo(hash);
  }, 200)

  $('.js-scroll-to').on('click', function () {
    scrollTo($(this).attr('data-scroll-to'))
  });
};

function scrollTo(selector) {
  const element = $(selector);
  const navHeight = $('.navbar').innerHeight();

  if (element.length) {
    $('html, body').animate({ scrollTop: element.offset().top - navHeight }, 300);
  }
}

scrollToElement();