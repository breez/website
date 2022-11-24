// import $ from 'jquery';

const scrollToElement = () => {
  const hash = window.location.hash;

  scrollTo(hash);

  $('.js-scroll-to').on('click', function () {
    scrollTo($(this).attr('data-scroll-to'))
  });
};

function scrollTo(selector) {
  const element = $(selector);
  const navHeight = $('.navbar').innerHeight();

  if (element.length) {
    $('html, body').animate({ scrollTop: element.offset().top - navHeight }, 500);
  }
}

scrollToElement();