$(document).ready(function() {
  $('a[href="' + this.location.pathname + '"]').parent().addClass('active');

  const formLink = $(".form")
  formLink.on('click', function () {
    $('a[href="' + location.pathname + '"]').parent().removeClass('active');
    formLink.addClass('active');
  });

});