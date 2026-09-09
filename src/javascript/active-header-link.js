$(document).ready(function () {
  // active header link
  $(`a[href="${window.location.pathname.slice(0, -1)}"], a[href="${window.location.pathname}"]`).parent().addClass('active');

  // Prevent safari loading from cache when back button is clicked
  window.onpageshow = function(event) {
    if (event.persisted) {
      window.location.reload()
    }
  };
});