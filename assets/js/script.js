$(document).ready(function(){
    'use strict';
    /*----------------------------------------
     change navbar theme on load
     ----------------------------------------*/
    var scroll = $(window).scrollTop();
    if (scroll >= 60) {
        $(".main-navbar").addClass("darkHeader");
    } else {
        $(".main-navbar").removeClass("darkHeader");
    }

    /*----------------------------------------
     passward show hide
     ----------------------------------------*/
    $('.show-hide').show();
    $('.show-hide span').addClass('show');

    $('.show-hide span').click(function(){
        if( $(this).hasClass('show') ) {
            $('input[name="login[password]"]').attr('type','text');
            $(this).removeClass('show');
        } else {
            $('input[name="login[password]"]').attr('type','password');
            $(this).addClass('show');
        }
    });
    $('form button[type="submit"]').on('click', function(){
        $('.show-hide span').text('Show').addClass('show');
        $('.show-hide').parent().find('input[name="login[password]"]').attr('type','password');
    });


 /*------------------------
     loader
     --------------------------*/
     $('.loader-wrapper').fadeOut('slow', function() {
            $(this).remove();
        });
    
	
    /*----------------------------------------
     Dark Header
     ----------------------------------------*/
    $(window).scroll(function() {
        var scroll = $(window).scrollTop();
        if (scroll >= 60) {
            $(".main-navbar").addClass("darkHeader");
        } else {
            $(".main-navbar").removeClass("darkHeader");
        }
    });

    /*----------------------------------------
     mobile menu nav click hide collapse
     ----------------------------------------*/
    var mobile_menu = $( window ).width();
    if(mobile_menu < 991){
        $("nav a.nav-link").on('click', function(event) {
            
            if(!$(this).hasClass('dropdown-toggle')){
                $(".navbar-collapse").collapse('hide');
            }

        });
    }

    /*----------------------------------------
     home removeclass section
     ----------------------------------------*/
    var slider_caption = $( window ).width();
    if(slider_caption >= 2000){
        $('.home-right').addClass("home-contain");
    }
    if(slider_caption <= 1024){
        $('.home-right').addClass("home-contain");
    }

    /*----------------------------------------
     GO to Home
     ----------------------------------------*/
    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 500) {
            $('.tap-top').fadeIn();
        } else {
            $('.tap-top').fadeOut();
        }
    });
    $('.tap-top').on('click', function() {
        $("html, body").animate({
            scrollTop: 0
        }, 600);
        return false;
    });



    /*----------------------------------------
     Slider Section
     ----------------------------------------*/
    var screenshot = $(".screenshot-carousel");
    screenshot.owlCarousel({
        loop:true,
        margin:30,
        nav:false,
        dots:false,
        center:true,
        autoplay: true,
        autoplayTimeout: 8000,
        responsive:{
            0:{
                items:2,
            },
            767:{
                items:2,
            },
            768:{
                items:3,
            },
            992:{
                items:4,
            },
            1200:{
                items:5
            }
        }
    });
    var screenshotRtl = $(".screenshot-carousel-rtl");
    screenshotRtl.owlCarousel({
        rtl:true,
        loop:true,
        margin:30,
        nav:false,
        dots:false,
        center:true,
        autoplay: true,
        autoplayTimeout: 8000,
        responsive:{
            0:{
                items:2,
            },
            767:{
                items:2,
            },
            768:{
                items:3,
            },
            992:{
                items:4,
            },
            1200:{
                items:5
            }
        }
    });

    var team = $(".team-carousel");
    team.owlCarousel({
        loop:true,
        margin:30,
        nav:false,
        dots:true,
        responsive:{
            0:{
                items:1,
                margin:5,
            },
            600:{
                items:1,
                margin:5,
            },
            768:{
                items:2,
            },
            992:{
                items:3,
            },
            1000:{
                items:5,
            }
        }
    });
    var teamRtl = $(".team-carousel-rtl");
    teamRtl.owlCarousel({
        rtl:true,
        loop:true,
        margin:30,
        nav:false,
        dots:true,
        responsive:{
            0:{
                items:1,
                margin:5,
            },
            600:{
                items:1,
                margin:5,
            },
            768:{
                items:2,
            },
            992:{
                items:3,
            },
            1000:{
                items:3,
            }
        }
    });

    var blog = $(".blog-carousel");
    blog.owlCarousel({
        loop:true,
        margin:30,
        nav:false,
        dots:true,
        responsive:{
            0:{
                items:1,
                margin:5,
                nav:false,
            },
            600:{
                items:1,
                margin:0,
                nav:false,
            },
            768:{
                items:2,
            },
            1000:{
                items:2
            }
        }
    });
    var blogRtl = $(".blog-carousel-rtl");
    blogRtl.owlCarousel({
        rtl:true,
        loop:true,
        margin:30,
        nav:false,
        dots:true,
        responsive:{
            0:{
                items:1,
                margin:5,
                nav:false,
            },
            600:{
                items:1,
                margin:0,
                nav:false,
            },
            768:{
                items:2,
            },
            1000:{
                items:2
            }
        }
    });
    

    var price = $(".price-carousel");
    price.owlCarousel({
        loop:true,
        margin:30,
        nav:false,
        dots:false,
        responsive:{
            0:{
                items:1,
                dots:true,
                margin:0
            },
            600:{
                items:1,
                dots:true,
                margin:0,
            },
            768:{
                items:2,
                dots:true,
            },
            992:{
                items:3,
            },
            1000:{
                items:3
            }
        }
    });


    var priceRtl = $(".price-carousel-rtl");
    priceRtl.owlCarousel({
        rtl:true,
        loop:true,
        margin:30,
        nav:false,
        dots:false,
        responsive:{
            0:{
                items:1,
                dots:true,
                margin:0
            },
            600:{
                items:1,
                dots:true,
                margin:0,
            },
            768:{
                items:2,
                dots:true,
            },
            992:{
                items:3,
            },
            1000:{
                items:3
            }
        }
    });

    var testimonial = $(".testimonial-carousel");
    testimonial.owlCarousel({
        loop:true,
        margin:0,
        nav:true,
        navClass:['owl-prev','owl-next'],
        navText:['<img src="assets/images/back.png">','<img src="assets/images/next.png">'],
        dots:false,
        responsive:{
            0:{
                items:1,
                dots:true,
                nav:false
            },
            600:{
                items:1,
                dots:true,
                nav:false
            },
            991:{
                items:1,
            },
            1000:{
                items:1
            }
        }
    });

    var testimonialRtl = $(".testimonial-carousel-rtl");
    testimonialRtl.owlCarousel({
        rtl: true,
        loop: true,
        margin: 0,
        nav: true,
        navClass: ['owl-prev', 'owl-next'],
        navText: ['<img src="../assets/images/back.png">', '<img src="../assets/images/next.png">'],
        dots: false,
        responsive: {
            0: {
                items: 1,
                dots: true,
                nav: false
            },
            600: {
                items: 1,
                dots: true,
                nav: false
            },
            991: {
                items: 1,
            },
            1000: {
                items: 1
            }
        }
    });   
    
});

function onSetTypeContactForm(index){
    var contactType = document.getElementsByName('contact_type')[0];
    contactType.selectedIndex = index;
    contactType.classList.remove('placeholder');
}

$('select').change(function() {
    if ($(this).children('option:first-child').is(':selected')) {
      $(this).addClass('placeholder');
    } else {
     $(this).removeClass('placeholder');
    }
   });