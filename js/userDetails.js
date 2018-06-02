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

function getImageDetails(image_id) {
    var Accesstoken = sessionStorage.getItem('AccessToken');
    console.log("image id is " + image_id)
    request_url = "https://vjbj3fv2sc.execute-api.us-east-1.amazonaws.com/PicssharzProd/id/" + image_id
    $.ajax({
        url: request_url,
        type: 'GET',
        headers: {
            'Authorization': Accesstoken
        },
        success: function (data) {
            if (data) {
                if (data["Items"][0]) {
                    var first_item = data["Items"][0];
                    if (first_item) {
                        console.log("Getting user profile image");
                        console.log(first_item);
                        img_result_title = first_item["title"] ? first_item["title"]["S"] : "";
                        img_result_url_main = first_item["url_main"] ? first_item["url_main"]["S"] : "";
                        img_result_upload_user = first_item["upload_user"] ? first_item["upload_user"]["S"] : "";
                        img_result_description = first_item["description"] ? first_item["description"]["S"] : "";
                        img_result_tags = first_item["tags"] ? first_item["tags"]["L"] : "";
                        img_result_time = first_item["time"] ? first_item["time"]["S"] : "";
                        img_result_like_by = first_item["like_by"] ? first_item["like_by"]["L"] : "";
                        img_result_thumb = first_item["url_thumb"] ? first_item["url_thumb"]["S"] : ""; 
       
                        $("#profilePic").attr("src", img_result_thumb);
                    }
                }
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("An error occurred while trying to get the image details: " + errorThrown);
        }
    });
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
                first_item = data["Items"][0];
                if (first_item) {
                    //console.log(first_item["followers"]["L"][0]["S"]);
                    user_result_username = first_item["username"]["S"];
                    user_result_dob = first_item["dob"] ? first_item["dob"]["S"] : "";
                    user_result_about = 'About:  ' + first_item["about"] ? first_item["about"]["S"] : "";
                    user_result_account_created_time = 'Account Created timestamp: ' + first_item["account_created_time"] ? first_item["account_created_time"]["S"] : "";
                    user_result_likes = first_item["likes"] ? first_item["likes"]["L"] : "";
                    user_result_country = 'Country:  ' + first_item["country"] ? first_item["country"]["S"] : "";
                    user_result_following = first_item["following"] ? first_item["following"]["L"] : "";
                    user_result_followers = first_item["followers"] ? first_item["followers"]["L"] : "";
                    user_uploaded_images = first_item["uploaded_images"] ? first_item["uploaded_images"]["L"] : "";
                    
                    console.log(user_uploaded_images);
                    // show the user's profile picture as the first image they have uploaded, if it exists
                    if(user_uploaded_images && user_uploaded_images.length >= 1){
                        first_uploaded_image_id = user_uploaded_images[0]["S"];
                        getImageDetails(first_uploaded_image_id);
                    }
                    
                    document.getElementById("name").innerHTML = user_result_username;
                    document.getElementById("about").innerHTML = user_result_about;
                    document.getElementById("country").innerHTML = user_result_country;
                    document.getElementById("dob").innerHTML = user_result_dob;
                    document.getElementById("account_created_time").innerHTML = user_result_account_created_time;
                    other_details_html = showListOfItems(user_result_likes, "Likes", "image_details.html?id=");
                    other_details_html += showListOfItems(user_result_following, user_result_username + " is following", "user_details.html?id=");
                    other_details_html += showListOfItems(user_result_followers, user_result_username + "'s followers", "user_details.html?id=");
                    other_details_html += showListOfItems(user_uploaded_images, user_result_username + "'s images", "image_details.html?id=");
                    //document.getElementById("other_info").innerHTML += other_details_html;
                    
                    if(first_item["followers"]){
                    for (var i=0; i< first_item["followers"].length; i++){
                        appender = '<li class="list-group-item"> <a href="./user_details.html?id='+ first_item["followers"]["L"][i]["S"] + '">' + first_item["followers"]["L"][i]["S"] + '</a></li>';
                        $("#fing").append(appender);
                    }}
                    
                    if(first_item["following"]){
                    for (var i=0; i< first_item["following"]["L"].length; i++){
                        appender = '<li class="list-group-item"> <a href="./user_details.html?id='+ first_item["following"]["L"][i]["S"] + '">' + first_item["following"]["L"][i]["S"] + '</a></li>';
                        $("#fers").append(appender);
                    }}
                    
                    if(first_item["likes"]){
                    for (var i=0; i< first_item["likes"]["L"].length; i++){
                        appender = '<li class="list-group-item"> <a href="./image_details.html?id='+ first_item["likes"]["L"][i]["S"] + '">' + first_item["likes"]["L"][i]["S"] + '</a></li>';
                        $("#lkrs").append(appender);
                    }}
                    
                    if(first_item["uploaded_images"]){
                    for (var i=0; i< first_item["uploaded_images"]["L"].length; i++){
                        appender = '<li class="list-group-item"> <a href="./image_details.html?id='+ first_item["uploaded_images"]["L"][i]["S"] + '">' + first_item["uploaded_images"]["L"][i]["S"] + '</a></li>';
                        $("#imgz").append(appender);
                    }}
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