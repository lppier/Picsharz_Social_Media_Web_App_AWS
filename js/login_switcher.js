var bucketName = 'team30ws-mediarepofinalresized';
var bucketRegion = 'us-east-1';
var IdentityPoolId = 'us-east-1:80a04569-cb3e-4321-bbd3-2049ac9c23cc';

// AWS.config.update({
//     region: bucketRegion,
//     credentials: new AWS.CognitoIdentityCredentials({
//         IdentityPoolId: IdentityPoolId
//     })
// });

var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: { Bucket: bucketName }
});


$(function () {

    // Check on load if user is authenticated
    Cognito.isAuthenticated()
        .then(function () {
            console.log("Authenticated");
            $('#loginSwitch').hide();
            $('#logoutSwitch').show();
            $('#photoUploader').show();
            // var imgurl = "https://s3.amazonaws.com/team30ws-mediarepofinalresized/1527066615374_male_avatar.png";
            // $("#imageBox").html('<img src="' + imgurl + '" />');
            // console.log("displaying image fool");

            $('#feedLoading').show();
            $('#userFeed').show();
            $('#staticImages').hide();
            var userId = cacheUserDetails();
            generateUserFeed(userId);
        })
        .catch(function (error) {
            console.log("Not authenticated");
            $('#logoutSwitch').hide();
            $('#photoUploader').hide();
            $('#userFeed').hide();
            $('#staticImages').show();

        })

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

    function generateUserFeed(userId) {
        var Accesstoken = sessionStorage.getItem('AccessToken');        
        if (userId) {
            console.log("UserId: " + userId);
            request_url = "https://vjbj3fv2sc.execute-api.us-east-1.amazonaws.com/PicssharzProd/feed/" + userId;
            console.log("url" +request_url)
            $.ajax({
                url: request_url,
                type: 'GET',
                headers: {
                    'Authorization': Accesstoken
                },                
                success: function (data) {
                    $("#feedLoading").html("Your feed...")
                    console.log(data);
                    feed_results = data;
                    // alert('Number of feed images: ' + feed_results.length);

                    for (var i = 0; i < feed_results.length; i++) {
                        feed_image = feed_results[i];
                        image_id = feed_image["id"];
                        image_url_thumb = feed_image["presigned_url_thumb"];
                        image_title = feed_image["title"];
                        image_uploaded_by = feed_image["upload_user"];

                        if (image_url_thumb) {
                            image_html =
                                "<div class=\"card\">" +
                                "<a href='image_details.html?id=" + image_id + "'>" +
                                "<img src='" + image_url_thumb + "'>" +
                                "<p><span>" + image_title + "</span></p>" +
                                "<p><span><a href='user_details.html?id=" + image_uploaded_by + "'>" + image_uploaded_by + "</a></span></p>" +
                                "</a>" +
                                "</div>";
                            $("#userFeed").append(image_html);
                        }
                    }
                },
                error: function (data) {
                    alert('An error occurred while fetching the feed. Please try again.');
                    console.log(data);
                }
            });
        }
    }

    function cacheUserDetails() {
        var Accesstoken = sessionStorage.getItem('AccessToken');         
        var data = {
            UserPoolId: 'us-east-1_SDBkZhuhS',
            ClientId: '1024n0vvdvpul68t4tqn2ae4sj'
        };
        var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
        var cognitoUser = userPool.getCurrentUser();
        var currentUserId = cognitoUser.getUsername();

        // set the user ID
        sessionStorage.setItem("UserId", currentUserId);

        // get the user details from the user table
        request_url = "https://vjbj3fv2sc.execute-api.us-east-1.amazonaws.com/PicssharzProd/userid/" + currentUserId;

        $.ajax({
            url: request_url,
            type: 'GET',
            headers: {
                'Authorization': Accesstoken
            },            
            success: function (data) {
                if (data) {
                    console.log("Getting the user details for the current user");
                    first_item = data["Items"][0];
                    console.log(first_item);
                    var userDetails = {}
                    userDetails["following"] = [];
                    userDetails["likes"] = [];
                    if (first_item["following"] && first_item["following"]["L"]) {
                        for (var itr = 0; itr < first_item["following"]["L"].length; itr++) {
                            userDetails["following"].push(first_item["following"]["L"][itr]["S"]);
                        }
                    }

                    if (first_item["likes"] && first_item["likes"]["L"]) {
                        for (var itr = 0; itr < first_item["likes"]["L"].length; itr++) {
                            userDetails["likes"].push(first_item["likes"]["L"][itr]["S"]);
                        }
                    }

                    sessionStorage.setItem("UserDetails", JSON.stringify(userDetails));
                }
            }

        });

        return currentUserId;
    }
});

