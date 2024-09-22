const spinnerWrapperEl = document.querySelector(".spinner-wrapper");
if (spinnerWrapperEl !== null) {
  window.addEventListener("load", () => {
    spinnerWrapperEl.style.opacity = "0";

    setTimeout(() => {
      spinnerWrapperEl.style.display = "none";
    }, 300);
  });
}
