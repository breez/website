window.addEventListener('DOMContentLoaded', (event) => {
//   $(document).ready(function() {
  'use strict';

  /* ---- particles.js config ---- */
  // setTimeout(() => {
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
            src: "/bitcoin.png",
            width: 100,
            height: 100,
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
  // }, 1000)

});