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

// home & mobile section slider
import './javascript/mobile-section-slider'

// mobile page frame slider
import './javascript/mobile-frame-slider'
import './javascript/particles-bitcoin'

import { load } from 'recaptcha-v3'


const reCalc = () => {
    if(window.innerWidth <= 576) {
        const heroHeight = $('.hero-section').height()
        // const heroHeight = $(window).height();
        const infoHeight = $('#hero-info-block').height()

        const imageHeight = (heroHeight - infoHeight - 122) / 2
        const imgContainer = $('.image-container')

        imgContainer.css('height', imageHeight+'px')

        console.log(heroHeight, 'heroHeight');
        console.log(infoHeight, 'infoHeight');
        console.log(imageHeight, 'imageHeight');
    }
}

reCalc()



load('6LcXRpgUAAAAAME7hVWwxUI0BvOuz6QEocYmUpIa').then((recaptcha) => {
    recaptcha.execute('contact').then((token) => {
        var recaptchaResponse = document.getElementById('recaptcha_response');
        recaptchaResponse.value = token;
        console.log(token) // Will print the token
    })
})
