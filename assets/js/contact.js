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
                $('#alertModal').modal();
                $('#alertModal .modal-title').text("Success!");
                $('#alertModal .modal-body .lead').text("Your Inquiry is received, we will respond you soon.");
            })
            .done(function() {
                //console.log( "second success" );
            })
            .fail(function() {
                console.log("error in post");
                $('#alertModal').modal();
                $('#alertModal .modal-title').text("Failed!");
                $('#alertModal .modal-body .lead').text("There is Some Error.");
           });
        return false; // required to block normal submit since you used ajax
    }

});
});