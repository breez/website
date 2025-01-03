(function () {
    'use strict';

    // Wait for the DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.querySelector('.js-collapse-btn');

        // Check if the button exists in the DOM
        if (btn) {
            const arrow = btn.querySelector('.js-arrow');

            btn.addEventListener('click', function () {
                const list = document.querySelector('.js-collapsed-partners');
                list.classList.toggle('collapsed');

                // Check if arrow exists before toggling the 'rotated' class
                if (arrow) {
                    arrow.classList.toggle('rotated');
                }
            });
        }
    });
})();
