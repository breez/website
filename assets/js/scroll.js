$(document).ready(function(){
    'use strict';
    if($( window ).width() >= 991 ) {
        $("a").on('click', function(event) {
            if (this.hash !== "") {
                event.preventDefault();
                var hash = this.hash;
                $('html, body').animate({
                    scrollTop: $(hash).offset().top - 75
                }, 1000, function(){
                });
                return false;
            }
        });
    }else {
        $("a").on('click', function(event) {
            if (this.hash !== "") {
                event.preventDefault();
                var hash = this.hash;
                $('html, body').animate({
                    scrollTop: $(hash).offset().top - 50
                }, 1000, function(){
                });
                return false;
            }
        });
    }
});