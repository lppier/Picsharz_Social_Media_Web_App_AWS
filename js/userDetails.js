function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function showListOfItems(item_list, header_text, link_text) {
    if (item_list) {
        html_to_add = "<h4>" + header_text + "</h4>"
        html_to_add += "<ul>";
        for (itr = 0; itr < item_list.length; itr++) {
            var elem = item_list[itr]["S"];
            if (link_text) {
                html_to_add += "<li><span><a href='" + link_text + elem + "'>" + elem + "</a></span></li>";
            } else {
                html_to_add += "<li><span>" + elem + "</span></li>";
            }
        }
        html_to_add += "</ul>";
        return html_to_add;
    }

    return "";
}



function displayProfileId(userId) {
    var Accesstoken = sessionStorage.getItem('AccessToken');
    if (userId) {
       // console.log("UserId: " + userId);
        request_url = "https://vjbj3fv2sc.execute-api.us-east-1.amazonaws.com/PicssharzProd/feed/" + userId;
       // console.log("url" + request_url)
        $.ajax({
            url: request_url,
            type: 'GET',
            headers: {
                'Authorization': Accesstoken
            },
            success: function (data) {
                $("#feedLoading").html("Your feed...")
                //console.log(data);
                feed_results = data;
                // alert('Number of feed images: ' + feed_results.length);
                if (feed_results.length > 0) {
                    feed_image = feed_results[feed_results.length-1];
                    image_url_thumb = feed_image["url_thumb"];
                    //console.log(image_url_thumb);
                    //$("#profilePic").html("<img class=\"img-fluid mb-5 d-block mx-auto\" src='\" + image_url_thumb + \"' alt=\"\">")
                    $("#profilePic").attr("src", image_url_thumb);
                }
                 for (var i = 0; i < feed_results.length; i++) {
                     feed_image = feed_results[i];
                     image_url_thumb = feed_image["url_thumb"];
                     image_title = feed_image["title"];
                     appender = '<figure class="slider__item"><img class="slider__image" src="' + image_url_thumb + '"/><figcaption class="slider__caption">' + image_title + '</figcaption></figure>';
                     $("#slider").append(appender);
                     //console.log("Success")
                
                 }
            },
            error: function (data) {
                alert('An error occurred while fetching the feed. Please try again.');
                //console.log(data);
            }
        });
    }
}

function getUserDetails() {
    var Accesstoken = sessionStorage.getItem('AccessToken');
    user_id = getParameterByName("id");
    request_url = "https://vjbj3fv2sc.execute-api.us-east-1.amazonaws.com/PicssharzProd/userid/" + user_id
    followUnfollowButtonClick();

    $.ajax({
        url: request_url,
        type: 'GET',
        headers: {
            'Authorization': Accesstoken
        },
        success: function (data) {
            if (data) {
                displayProfileId(user_id);
                first_item = data["Items"][0];
                if (first_item) {
                    console.log(first_item["followers"]["L"][0]["S"]);
                    user_result_username = first_item["username"]["S"];
                    user_result_dob = first_item["dob"] ? first_item["dob"]["S"] : "";
                    user_result_about = 'About:  ' + first_item["about"] ? first_item["about"]["S"] : "";
                    user_result_account_created_time = 'Account Created timestamp: ' + first_item["account_created_time"] ? first_item["account_created_time"]["S"] : "";
                    user_result_likes = first_item["likes"] ? first_item["likes"]["L"] : "";
                    user_result_country = 'Country:  ' + first_item["country"] ? first_item["country"]["S"] : "";
                    user_result_following = first_item["following"] ? first_item["following"]["L"] : "";
                    user_result_followers = first_item["followers"] ? first_item["followers"]["L"] : "";
                    user_uploaded_images = first_item["uploaded_images"] ? first_item["uploaded_images"]["L"] : "";

                    //user_result_name = 'Hi ' + user_result_name 
                    document.getElementById("name").innerHTML = user_result_username;
                    document.getElementById("about").innerHTML = user_result_about;
                    document.getElementById("country").innerHTML = user_result_country;
                    document.getElementById("dob").innerHTML = user_result_dob;
                    document.getElementById("account_created_time").innerHTML = user_result_account_created_time;
                    other_details_html = showListOfItems(user_result_likes, "Likes", "image_details.html?id=");
                    other_details_html += showListOfItems(user_result_following, user_result_username + " is following", "user_details.html?id=");
                    other_details_html += showListOfItems(user_result_followers, user_result_username + "'s followers", "user_details.html?id=");
                    other_details_html += showListOfItems(user_uploaded_images, user_result_username + "'s images", "image_details.html?id=");
                    document.getElementById("other_info").innerHTML += other_details_html;
                    
                   
                }
            }

        }

    });
}

function followUnfollowUser() {
    var Accesstoken = sessionStorage.getItem('AccessToken');
    following_id = getParameterByName("id");
    //console.log("following_id:", following_id);
    var currentUserId = sessionStorage.getItem("UserId");
    //console.log("Current user ID: " + currentUserId);
    if (currentUserId) {
        data = {
            user_id: currentUserId,
            following_id: following_id
        };
        //console.log(data)
        var settings = {
            "async": true,
            "dataType": "json",
            "crossDomain": true,
            "url": " https://vjbj3fv2sc.execute-api.us-east-1.amazonaws.com/PicssharzProd/follow",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": Accesstoken
            },
            "processData": false,
            //"data": data
            //"data": "{\n\"user_id\": \"3\",\n\"following_id\": \"7\"\n}"
            "data": JSON.stringify(data)
        }
        //console.log(settings)
        $.ajax(settings).done(function (response) {
            sessionResponse = response["Attributes"];

            // update the user details based on the response
            sessionStorage.setItem("UserDetails", JSON.stringify(sessionResponse));
            followUnfollowButtonClick();
            location.reload();
        });
    }


}

function followUnfollowButtonClick() {
    following_id = getParameterByName("id");
    sessionResult = sessionStorage.getItem("UserDetails")
    //console.log(sessionResult)
    if (sessionResult) {
        sessionResult = JSON.parse(sessionResult)
        //console.log(sessionResult)
        followingList = sessionResult["following"]
        //console.log(followingList)
        if (following_id != sessionStorage.getItem("UserId")) {
            if (followingList && followingList.indexOf(following_id) >= 0) {
                //console.log("following id in list")
                // document.getElementById("clickfollow").value = "Unfollow";
                document.getElementById("followme").innerHTML = "UNFOLLOW";
            } else {
                //console.log("following id not in list")
                // document.getElementById("clickfollow").value = "Follow";
                document.getElementById("followme").innerHTML = "FOLLOW";

            }
            // localStorage.setItem("followButton", document.getElementById("clickfollow").value);
            localStorage.setItem("followButton", document.getElementById("followme").innerHTML);
        }
      else{
          $("#clickfollow").hide();
      }  
    }

}