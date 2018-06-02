$(function () {

    $('#logoutA').on('click', function () {
        //test();
        console.log("came in log out click");
        signOut();
    });


    function signOut() {
        Cognito.signOut()
            .then(function () {
                alert("Signed out! Thanks for visiting Picsharz!");
                $('#loginSwitch').show();
                $('#logoutSwitch').hide();
                location.replace("index.html");
            })
            .catch(function (error) {
                console.error(error);
            })
    }

});
