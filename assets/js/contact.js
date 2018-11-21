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
            minlength: 10
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
                console.log(data, status);
                if(data != 1){
                    $("#alert_mail").html("<strong>Success! </strong>Your Inquiry is received, we will respond you soon.");
                    $("#mail_alert_class").addClass("alert alert-success alert-dismissible");
                    $("#mail_alert_class").removeClass("d-none");
                }
                else
                {
                    $("#alert_mail").html("<strong>Failed! </strong>There is Some Error.");
                    $("#mail_alert_class").addClass("alert alert-danger alert-dismissible");
                    $("#mail_alert_class").removeClass("d-none");
                }
            })
            .done(function() {
                console.log( "second success" );
            })
            .fail(function() {
                console.log("error in post");
                $("#alert_mail").html("<strong>Failed! </strong>There is Some Error.");
                $("#mail_alert_class").addClass("alert alert-danger alert-dismissible");
                $("#mail_alert_class").removeClass("d-none");
           });
        return false; // required to block normal submit since you used ajax
    }

});
});