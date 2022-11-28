window.addEventListener('DOMContentLoaded', (event) => {

  const ua = navigator.userAgent;
  const checker = {
    "iphone": ua.match(/iPhone/),
    "android": ua.match(/Android/)
  };
  if (checker.android) {
    $("html").addClass("android");
  }
  if (checker.iphone) {
    $("html").addClass("iphone");
  }

});