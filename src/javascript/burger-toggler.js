// toggle burger menu icon
const burgerToggler = () => {
  $(function () {
    const burger = $('.burger')
    burger.click(function () {
      burger.toggleClass('open')
    })

    // Flag the header while the mobile menu is open so its whole background
    // can become a solid panel. Bootstrap only marks the collapse with
    // `.show`, which some browsers can't reach from the header (e.g. via
    // `:has()`), so we drive a class on the header directly instead.
    const collapse = document.getElementById('navbarBreez')
    const header = document.querySelector('.header')
    if (collapse && header) {
      // Toggle at the START of both transitions so the background fades in
      // sync with the collapse animation (no snap at the end).
      collapse.addEventListener('show.bs.collapse', () => header.classList.add('menu-open'))
      collapse.addEventListener('hide.bs.collapse', () => header.classList.remove('menu-open'))
    }
  })
}

burgerToggler();