$(document).ready(function(){
'use strict';
$("#contact-form").validate({
    ignore: ":hidden",
    rules: {
        fullname: {
            required: true,
            minlength: 3
        },
        contact_type: {
            required: true
        },
        email: {
            required: true,
            email: true
        },
        message: {
            required: true,
        },
    },
    submitHandler: function (form) {
        $.post("/contact",
            {
                fullname: $('#fullname').val(),
                email: $('#email').val(),
                contact_type: $('#contact_type').val(),
                message: $('#message').val(),
                send: $('#emailsend').val()
            },
            function(data, status){
                //showToast("Your message was successfully sent to Breez.", 4000, "success-toast");
            })
            .done(function() {
                console.log("success in post");
                showToast("Your message was successfully sent to Breez.", 4000, "success-toast");
                $('#contact-form').trigger("reset");
                $('#contact_type').prop('selectedIndex', 0);
                $('#contact_type').css('color', '#92969a');
            })
            .fail(function() {
                console.log("error in post");
                showToast("There was an error trying to send your message.", 4000, "alert-toast");
                showToast("Your message was successfully sent to Breez.", 8000, "success-toast");
           });
        return false; // required to block normal submit since you used ajax
    }

});
});

// Response Toast Notification
var MARGIN = 10;
var shownToasts = [];
var toastHeight = window.innerHeight / 12;

function showToast(content, time, extraClass) {
    var toast = document.createElement("div");
    toast.innerHTML = content;
    toast.classList.add("toast", extraClass);
    toast.style.bottom = toastHeight + "px";
    document.getElementsByTagName("body")[0].appendChild(toast);
    shownToasts.push(toast);
    var height = toast.getBoundingClientRect();
    toastHeight += MARGIN + height;
    setTimeout(function () { hideToast(toast); }, time);
}

function hideToast(toast) {
    shownToasts = shownToasts.filter(function (e) { return e !== toast; });
    var height = toast.getBoundingClientRect();
    toastHeight -= MARGIN + height;
    document.getElementsByTagName("body")[0].removeChild(toast);
    adjustPositioning();
}

function adjustPositioning() {
    toastHeight = window.innerHeight / 12;
    for (var i = 0; i < shownToasts.length; i++) {
        var toast = shownToasts[i];
        toast.style.bottom = toastHeight + "px";
        var height = toast.getBoundingClientRect();
        toastHeight += MARGIN + height;
    }
}
