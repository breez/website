(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.querySelector('.js-collapse-btn');

        if (btn) {
            const arrow = btn.querySelector('.js-arrow');

            btn.addEventListener('click', function () {
                const list = document.querySelector('.js-collapsed-partners');
                list.classList.toggle('visible');

                if (arrow) {
                    arrow.classList.toggle('rotated');
                }
            });
        }
    });
})();
