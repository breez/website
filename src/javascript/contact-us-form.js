// Disabling form submissions if there are invalid fields
(function () {
  'use strict'
  // Fetch all the forms we need to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')
  const emailInput = document.querySelector('.js-email-input')
  const requiredInputError =  document.querySelector('.js-required-input-error')
  const notValidEmailError =  document.querySelector('.js-not-valid-email-error')

  // Loop over them and prevent submission
  Array.from(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault()
        const isValidated = form.checkValidity()
        requiredInputError.classList.add('d-none')
        notValidEmailError.classList.add('d-none')

        if (isValidated) {
          $('.toast').show();
          form.reset()
          form.classList.remove('was-validated')
        } else {
          const emailValue = emailInput.value

          form.classList.add('was-validated')

          if (!emailValue) {
            requiredInputError.classList.remove('d-none')
          } else {
            notValidEmailError.classList.remove('d-none')
          }
        }

      }, false)
    })
})()


// close toast
$('.toast .btn-close').on('click', function () {
  $('.toast').hide()
})