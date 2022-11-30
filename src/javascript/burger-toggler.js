// toggle burger menu icon
const burgerToggler = () => {
  $(function () {
    const burger = $('.burger')
    burger.click(function () {
      burger.toggleClass('open')
    })
  })
}

burgerToggler();