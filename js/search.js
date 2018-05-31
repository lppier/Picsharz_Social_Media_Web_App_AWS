var bucketName = 'team30ws-mediarepofinalresized';
var bucketRegion = 'us-east-1';
var IdentityPoolId = 'us-east-1:80a04569-cb3e-4321-bbd3-2049ac9c23cc';

AWS.config.update({
    region: bucketRegion,
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId
    })
});

var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {Bucket: bucketName}
});




function getImageKeyFromUrl(imageUrl) {
    if (imageUrl) {
        lastIndexOfSlash = imageUrl.lastIndexOf("/");
        if (lastIndexOfSlash >= 0) {
            // the last part of the URL gets the key of the image
            image_key = imageUrl.substring(lastIndexOfSlash + 1);
            return image_key;
        }
    }
}

// Borrowed from here: https://stackoverflow.com/questions/32702431/display-images-fetched-from-s3
function encode(data) {
    var str = data.reduce(function (a, b) {
        return a + String.fromCharCode(b)
    }, '');
    return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
}

function performSearch() {
    search_text = $("#search_text").val();
    $("#feedLoading").hide();
    console.log("Search text: " + search_text);
    base_url = "https://search-picsharz-yakre5npnxnuzwv5657g3nuzfu.us-east-1.es.amazonaws.com/lambda-index/_search?q="
    if (search_text) {
        request_url = base_url + search_text;
        console.log("Request URL: " + request_url);


        $.ajax({
            url: request_url,
            type: 'GET',
            success: function (data) {
                // alert("Success");
                search_results = {};
                all_hits = data.hits.hits;
                if (all_hits.length == 0) {
                    alert("No results for the search term: " + search_text);
                }
                else {
                    $('#staticImages').show();

                    // clear the existing search result divs
                    $("#user_results").empty();
                    $("#image_results").empty();
                    user_info = false;
                    image_info = false;
                    shown_users = [];
                    image_queries = {};
                    for (var i = 0; i < all_hits.length; i++) {
                        if (all_hits[i]["_source"]) {
                            source = all_hits[i]["_source"];

                            // check if the current result is a user record
                            if (source.hasOwnProperty("username") || source.hasOwnProperty("name")) {
                                user_id = source["id"]["S"];
                                if (shown_users.indexOf(user_id) == -1) {
                                    // add the user which is being shown now
                                    shown_users.push(user_id);
                                    user_name = source["username"] ? source["username"]["S"] : "Not available";
                                    user_full_name = source["name"] ? source["name"]["S"] : "Not available";
                                    user_followers = source["followers"] ? source["followers"]["L"] : [];
                                    user_gender = source["gender"] ? source["gender"]["S"] : "m";
                                    user_num_followers = 0;
                                    if (user_followers) {
                                        user_num_followers = user_followers.length;
                                    }

                                    // show the user details banner
                                    if (!user_info) {
                                        $("#user_results_header").show();
                                        user_info = true;
                                    }


                                    // get the avatar file based on the user gender
                                    avatar_file_name = user_gender.toLowerCase().startsWith("f") ? "girl" : "boy";

                                    user_details_html = '<div class="col s6 m3 l1">'
                                        + '<div class="card">'
                                        + '<div class="card-image">'
                                        + '<img src="img/avatars/' + avatar_file_name + '.png">'
                                        //+ '<span class="card-title">' + user_full_name + '</span>'
                                        + '<a href="user_details.html?id=' + user_id + '" class="btn-floating halfway-fab waves-effect waves-light red"><i class="material-icons">add</i></a>'
                                        + '</div>'
                                        + '<div class="card-content">'
                                        + '<p>@' + user_name + '<br>Popularity Score: ' + user_num_followers + '</p>'
                                        + '</div>'
                                        + '</div>'
                                        + '</div>'
                                        + '</div>';
                                    $("#user_results").append(user_details_html);

                                } else {
                                    console.log("The user with ID " + user_id + " is already shown");
                                }
                            }
                            else {
                                // show the image results banner
                                if (!image_info) {
                                    $("#image_results_header").show();
                                    image_info = true;
                                }

                                image_result_id = source["id"]["S"];
                                image_result_url_thumb = source["url_thumb"] ? source["url_thumb"]["S"] : "";
                                image_html = '<a href="image_details.html?id=' + image_result_id + '"><img class="img-fluid" src="' + image_result_url_thumb + '" alt="" height=""></a>';
                                $("#staticImages").append(image_html);
                                console.log("Added image");
                            }
                        }
                    }
                }
            },
            error: function (data) {
                alert('An error occurred while performing the search. Please try again.');
                console.log(data);
            }
        });
    }
}

function bindImageToUserInterface(image_key, image_id, image_info) {
    var params = {
        Bucket: bucketName,
        Key: image_key
    }

    image_html =
        "<div class=\"card\">" +
        "<a href=\"image_details.html?id=" + image_id + " \">" +
        "<img src=\"" + "data:image/png;base64," + encode(data.Body) + "\">" +
        "</a>" +
        "</div>";
    $("#image_results").append(image_html);

    // s3.getObject(params, function (err, data) {
    //     if (err) {
    //         console.log(err, err.stack);
    //     }
    //     else {
    //
    //         // show the image results banner
    //         if (!image_info) {
    //             $("#image_results_header").show();
    //             image_info = true;
    //         }
    //
    //         image_html =
    //             "<div class=\"card\">" +
    //             "<a href=\"image_details.html?id=" + image_id + " \">" +
    //             "<img src=\"" + "data:image/png;base64," + encode(data.Body) + "\">" +
    //             "</a>" +
    //             "</div>";
    //         $("#image_results").append(image_html);
    //     }
    // });
}