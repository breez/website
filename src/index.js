import jquery from 'jquery';

window.jQuery = jquery;
window.$ = jquery;

import './styles/main.scss'

import 'bootstrap/dist/js/bootstrap.bundle'
// slick
import 'slick-carousel';

import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
// ..
AOS.init();

import './javascript/contact-us-form'
import './javascript/scroll-to-element'
import './javascript/active-header-link'
import './javascript/burger-toggler'


import './javascript/mobile-os-checker'

// home, mobile & sdk section sliders
import './javascript/mobile-section-slider'
import './javascript/sdk-section-slider'

// mobile page frame slider
import './javascript/mobile-frame-slider'
import './javascript/particles-bitcoin'

import './javascript/spinner-loader'

import { load } from 'recaptcha-v3'


// /////// decrease time loader
//
// /**
//  * Trigger a callback when the selected images are loaded:
//  * @param {String} selector
//  * @param {Function} callback
//  */
//
// const spinnerWrapperEl = document.querySelector('.spinner-wrapper');
//
// const onImgLoad = function(selector, callback){
//     $(selector).each(function(){
//         if (this.complete || /*for IE 10-*/ $(this).height() > 0) {
//             callback.apply(this);
//         }
//         else {
//             $(this).on('load', function(){
//                 callback.apply(this);
//             });
//         }
//     });
// };
//
// onImgLoad('img', function(){
//     console.log('remove loader');
//     spinnerWrapperEl.style.display = 'none';
// });



load('6LcXRpgUAAAAAME7hVWwxUI0BvOuz6QEocYmUpIa').then((recaptcha) => {
    recaptcha.execute('contact').then((token) => {
        var recaptchaResponse = document.getElementById('recaptcha_response');
        recaptchaResponse.value = token;
        console.log(token) // Will print the token
    })
})
