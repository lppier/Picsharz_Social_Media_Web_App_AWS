var bucketName = 'team30ws-mediarepofinal';
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
    params: {
        Bucket: bucketName
    }
});

function encode(data) {
    var str = data.reduce(function (a, b) {
        return a + String.fromCharCode(b)
    }, '');
    return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

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

function getImageDetails() {
    var Accesstoken = sessionStorage.getItem('AccessToken');
    image_id = getParameterByName("id");
    //console.log("image id is " + image_id)
    request_url = "https://vjbj3fv2sc.execute-api.us-east-1.amazonaws.com/PicssharzProd/id/" + image_id
    likeUnlikeButtonClick();
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

                        img_result_title = first_item["title"] ? first_item["title"]["S"] : "";
                        img_result_url_main = first_item["url_main"] ? first_item["url_main"]["S"] : "";
                        img_result_upload_user = first_item["upload_user"] ? first_item["upload_user"]["S"] : "";
                        img_result_description = first_item["description"] ? first_item["description"]["S"] : "";
                        img_result_tags = first_item["tags"] ? first_item["tags"]["L"] : "";
                        img_result_time = first_item["time"] ? first_item["time"]["S"] : "";
                        img_result_like_by = first_item["like_by"] ? first_item["like_by"]["L"] : "";

                        //document.getElementById("imagesection").innerHTML = '<h1 id="title">' + img_result_title + ' </h1> <img src="' + img_result_url_main + '" height="75%" width = "50%"> <p id = "description">' + img_result_description + '</p><p><h4>Image uploaded by: </h4><a href="user_details.html?id=' + img_result_upload_user + '">' + img_result_upload_user + '</a></p>';

                        lists_html = showListOfItems(img_result_tags, "Tags");
                        lists_html += showListOfItems(img_result_like_by, "Liked By", "user_details.html?id=");
                        //document.getElementById("imagesection").innerHTML += lists_html;
                        
                        //=============================================================
                        
                       //console.log(first_item["tags"]["L"])
                        
                        
                        
                        $("#hero-area").css({"background-size": "contain", "background": "url(\"" + img_result_url_main + "\") no-repeat center/contain", "background-color": "#484848"});
                        
                       document.getElementById("imgdesc").innerHTML = img_result_description;
                        
                        document.getElementById("imgname").innerHTML = img_result_title;
                        
                        $("#visituser").on('click', function(){
     window.location = "user_details.html?id=" + img_result_upload_user ;    
});
                        
                        document.getElementById("imginfo").innerHTML = "<h2>Tags:</h2>";
                        
                        if(first_item["tags"])
                            {
                                //console.log(first_item["tags"]["L"].length);
                                for(var i=0;i<first_item["tags"]["L"].length;i++)
                                    {
                                        appender = '<span class="label label-primary">' + first_item["tags"]["L"][i]["S"] + '</span>&nbsp;&nbsp;&nbsp;&nbsp;';
                                        //console.log(first_item["tags"]["L"][i]["S"]);
                                        document.getElementById("imginfo").innerHTML += appender;
                                    }
                                
                            }
                        
                        //-------------
                        var Accesstoken = sessionStorage.getItem('AccessToken');
        //userId = document.getElementById("imgname").innerHTML;
        request_url = "https://vjbj3fv2sc.execute-api.us-east-1.amazonaws.com/PicssharzProd/feed/" + img_result_upload_user;

        $.ajax({
            url: request_url,
            type: 'GET',
            headers: {
                'Authorization': Accesstoken
            },
            success: function (data) {
                console.log("Feed data");
                console.log(data);
                feed_results = data;

                for (var i = 0; i < feed_results.length; i++) {
                    feed_image = feed_results[i];

                    // if the image is uploaded by the current user then append to the image viewer
                    if (feed_image["upload_user"] == img_result_upload_user) {
                        image_url_thumb = feed_image["url_thumb"];
                        
                    }
                    
                    $("#profilePic").attr("src", image_url_thumb);
                }
            },
            error: function (data) {
                alert('An error occurred while fetching the feed. Please try again.');
                //console.log(data);
            }
        });
    
                        //-------------
                        
                        
                        
                        
                        
                    }
                }
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("An error occurred while trying to get the image details: " + errorThrown);
        }
    });
}

function likeUnlikeImage() {
    var Accesstoken = sessionStorage.getItem('AccessToken');
    image_id = getParameterByName("id");
    var currentUserId = sessionStorage.getItem("UserId");
    //console.log("Current user ID: " + currentUserId);
    //currentUserId = "3"
    if (currentUserId) {
        data = {
            user_id: currentUserId,
            image_id: image_id
        };
        JSON.stringify(data)
        //console.log(data)
        var settings = {
            "async": true,
            "dataType": "json",
            "crossDomain": true,
            "url": "https://vjbj3fv2sc.execute-api.us-east-1.amazonaws.com/PicssharzProd/like",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": Accesstoken
            },
            "processData": false,
            //"data": data
            //"data": "{\"user_id\": \"pier6\",\"image_id\": \"2\"}"
            "data": JSON.stringify(data)
        }
        $.ajax(settings).done(function (response) {
            //console.log(response)
            sessionResponse = response["Attributes"]
            sessionStorage.setItem("UserDetails", JSON.stringify(sessionResponse));
            //console.log(response)
            likeUnlikeButtonClick();

            location.reload();

        });
    }
}

function likeUnlikeButtonClick() {
    image_id = getParameterByName("id");
    sessionResult = sessionStorage.getItem("UserDetails")
    //console.log(sessionResult)
    if (sessionResult) {
        sessionResult = JSON.parse(sessionResult)
        //console.log(sessionResult)
        likesList = sessionResult["likes"]
        console.log(likesList)
        if (likesList.includes(image_id)) {
            //console.log("image id in list")
            document.getElementById("liker").innerHTML = 'Unlike';
            $("#likeButton").addClass("hover");
        } else {
            //console.log("image id not in list")
            document.getElementById("liker").innerHTML = 'Like';
            $("#likeButton").removeClass("hover");

        }
        localStorage.setItem("followButton", document.getElementById("liker").innerHTML);
    }

}


//==============================================


