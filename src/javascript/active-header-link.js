$(document).ready(function () {
  $(`a[href="${window.location.pathname.slice(0, -1)}"], a[href="${window.location.pathname}"]`).parent().addClass('active');

  const formLink = $('.form');
  formLink.on('click', function () {
    $('a').parent().removeClass('active');
    formLink.addClass('active');
  });

  // close burger menu on click contact us link at mobile header only at home page
  $('.close-burger-mobile').on('click', function () {
    $('.navbar-toggler').attr('aria-expanded', 'false');
    $('.navbar-collapse').removeClass('show');
    $('.burger-slip').removeClass('open');
  });

});