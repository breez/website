$(document).ready(function () {
  // active header link
  $(`a[href="${window.location.pathname.slice(0, -1)}"], a[href="${window.location.pathname}"]`).parent().addClass('active');

  const formLink = $('.form');
  formLink.on('click', function () {
    $('a').parent().removeClass('active');
    formLink.addClass('active');
  });

  // Prevent safari loading from cache when back button is clicked
  window.onpageshow = function(event) {
    if (event.persisted) {
      window.location.reload()
    }
  };

  // close burger menu on click contact us link at mobile header only at home page
  $('.close-burger-mobile').on('click', function () {
    $('.navbar-toggler').attr('aria-expanded', 'false');
    $('.navbar-collapse').removeClass('show');
    $('.burger-slip').removeClass('open');
  });

});