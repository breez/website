(function () {
    'use strict'
    const btn = document.querySelector('.js-collapse-btn')
    const arrow = btn.querySelector('.js-arrow')
    btn.addEventListener('click', function () {
        const list = document.querySelector('.js-collapsed-partners')
        list.classList.toggle('collapsed');
        arrow.classList.toggle('rotated');
    });
})()
