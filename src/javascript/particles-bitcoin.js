window.addEventListener('DOMContentLoaded', (event) => {
//   $(document).ready(function() {
  'use strict';

  /* ---- particles.js config ---- */
  particlesJS("particles-js", {
    particles: {
      number: {
        value: 7,
        density: {
          enable: false,
          value_area: 600
        }
      },
      color: {
        value: "#ffffff"
      },
      shape: {
        type: "image",
        stroke: {
          width: 0,
          color: "#000000"
        },
        polygon: {
          nb_sides: 5
        },
        image: {
          // src: "src/assets/icons/bitcoin.svg",
          src: "data:image/png;base64,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",
          width: 100,
          height: 100
        }
      },
      opacity: {
        value: 0.1,
        random: false,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.1,
          sync: false
        }
      },
      size: {
        value: 20,
        random: false,
        anim: {
          enable: false,
          speed: 40,
          size_min: 50,
          sync: false
        }
      },
      line_linked: {
        enable: false,
        distance: 200,
        color: "#ffffff",
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "bounce",
        bounce: false,
        attract: {
          enable: false,
          rotateX: 80,
          rotateY: 80
        }
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: false,
          mode: "repulse"
        },
        onclick: {
          enable: false,
          mode: "repulse"
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 200,
          line_linked: {
            opacity: 0.5017974219129172
          }
        },
        bubble: {
          distance: 400,
          size: 40,
          duration: 2,
          opacity: 8,
          speed: 3
        },
        repulse: {
          distance: 200,
          duration: 0.4
        },
        push: {
          particles_nb: 4
        },
        remove: {
          particles_nb: 2
        }
      }
    },
    retina_detect: true
  });

});