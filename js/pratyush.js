
function setimg() {
    if (1) {
        var Accesstoken = sessionStorage.getItem('AccessToken');
        userId = document.getElementById("imgname").value;
        request_url = "https://vjbj3fv2sc.execute-api.us-east-1.amazonaws.com/PicssharzProd/feed/" + userId;

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
                    if (feed_image["upload_user"] == userId) {
                        image_url_thumb = feed_image["url_thumb"];
                        
                    }
                    
                    $("#profilePic").attr("src", img_url_thumb);
                }
            },
            error: function (data) {
                alert('An error occurred while fetching the feed. Please try again.');
                //console.log(data);
            }
        });
    }
}





