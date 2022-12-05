$(document).ready(function() {
  $(`a[href="${ window.location.pathname.slice(0, -1) }"], a[href="${ window.location.pathname }"]`).parent().addClass('active');

  const formLink = $(".form")
  formLink.on('click', function () {
    $('a').parent().removeClass('active');
    formLink.addClass('active');
  });

});