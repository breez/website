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
AOS.init({
  once: true,
  duration: 700,
  easing: 'ease-out-cubic',
});

import './javascript/contact-us-form'
import './javascript/scroll-to-element'
import './javascript/active-header-link'
import './javascript/burger-toggler'


import './javascript/mobile-os-checker'

// home, mobile & sdk section sliders
import './javascript/mobile-section-slider'

// mobile page frame slider
import './javascript/mobile-frame-slider'

import './javascript/sdk-section-collapsed'

import './javascript/spinner-loader'

import { load } from 'recaptcha-v3'
import './javascript/case-studies-filters'
import './javascript/case-studies-card-fx'
import './javascript/case-studies-home-carousel'
import './javascript/cs-value-network'
import './javascript/globe-lightning'
import './javascript/hero-typewriter'
import './javascript/sdk-statement-scrub'
import './javascript/sdk-agent-prompt'
import './javascript/glow-card-live'
import './javascript/glow-page'


// Not every page carries the contact form (the Misty wind-down notice does
// not), so skip reCAPTCHA entirely rather than throwing on a missing field.
if (document.getElementById('recaptcha_response')) {
    load('6LcXRpgUAAAAAME7hVWwxUI0BvOuz6QEocYmUpIa').then((recaptcha) => {
        recaptcha.execute('contact').then((token) => {
            var recaptchaResponse = document.getElementById('recaptcha_response');
            recaptchaResponse.value = token;
            console.log(token) // Will print the token
        })
    })
}
