$(function () {

    var bucketName = 'team30ws-mediarepofinal';
    //var bucketName = 'team30ws-mediarepo';
    var bucketRegion = 'us-east-1';
    var IdentityPoolId = 'us-east-1:80a04569-cb3e-4321-bbd3-2049ac9c23cc';


    AWS.config.update({
        region: bucketRegion,
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: IdentityPoolId
        })
    });

    // Cognito.isAuthenticated()
    //     .then(function() {
    //         console.log("Authenticated");
    //     })
    //     .catch(function(error) {
    //         console.log("Not authenticated");
    //         return;
    //     })
    // var userPool = Cognito.getUserPool();
    // var cognitoUser = userPool.getCurrentUser();
    // var s3;
    //
    // if (cognitoUser != null) {
    //     cognitoUser.getSession(function (err, session) {
    //         if (err) {
    //             alert(err);
    //             return;
    //         }
    //         console.log('session validity: ' + session.isValid());
    //         AWS.config.region = bucketRegion;
    //         AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    //             IdentityPoolId: IdentityPoolId,
    //             Logins: {
    //                 'cognito-idp.us-east-1.amazonaws.com/us-east-1_SDBkZhuhS': session.getIdToken().getJwtToken()
    //             }
    //         });
    //
    //         // Instantiate aws sdk service objects now that the credentials have been updated.
    //         s3 = new AWS.S3({
    //             apiVersion: '2006-03-01',
    //             params: {Bucket: bucketName}
    //         });
    //
    //     });
    // }
    s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: bucketName}
    });


    $('#addphoto').on('click', function () {
        //test();
        handleSubmit();
    });

    $('#cancelphoto').on('click', function () {
        pageReloadOnUploadSuccess();
    });

    $('#add-photo-modal').on("hidden.bs.modal", function () {
        $("#photoupload-body").html("<input id=\'photoupload\' type=\'file\' accept=\'image/*\'>");
        $("#tags").tagsinput('removeAll');
        $("#description").val("");
        $("#title").val("");
        $('#addphoto').show();
        $('#tags-body').show();
        $('#cancelphoto').text('CANCEL');
    });

    function test() {

        var test = Cognito.getUserName();
        console.log(test);
        // var files = document.getElementById('photoupload').files;
        // if (!files.length) {
        //     return alert('Please choose a file to upload first.');
        // }
        //
        //
        // var title = $("#title").val();
        // var tagstr = $("#tags").val();
        // var description = $("#description").val();
        // var taglist = tagstr.toString().split(',')
        // console.log(taglist);
        // console.log(taglist.length);
        // console.log(description);
        // // need 5 to fufil metadata, append empty if req
        // var maxlen = 5;
        //
        // if (taglist.length < maxlen) {
        //     var len = taglist.length
        //     for (i = 0; i < (maxlen - len); i++) {
        //         taglist.push('');
        //     }
        // }
        // console.log(taglist);
        //
        // var file = files[0];
        // var filename = file.name
        // filename = filename.replace(/ /g,"_");
        //
        // console.log(filename);
    }

    function handleSubmit() {
        var files = document.getElementById('photoupload').files;
        if (!files.length) {
            return alert('Please choose a file to upload first.');
        }

        // If user can see the photo upload, he IS logged in, no need to reauth
        var userName = Cognito.getUserName();
        console.log(userName);

        var title = $("#title").val();
        var tagstr = $("#tags").val();
        var description = $("#description").val();
        var taglist = tagstr.toString().split(',')
        console.log(taglist);
        console.log(taglist.length);
        console.log(description);
        // need 5 to fufil metadata, append empty if req
        var maxlen = 5;

        if (taglist.length < maxlen) {
            var len = taglist.length
            for (i = 0; i < (maxlen - len); i++) {
                taglist.push('');
            }
        }
        console.log(taglist);

        var file = files[0];
        var fileName = file.name;

        var albumName = "images"
        //var albumPhotosKey = encodeURIComponent(albumName) + '/';

        var datetime_hash = $.now();
        fileName = fileName.replace(/ /g, "_");
        console.log(fileName);
        var photoKey = datetime_hash + "_" + fileName; //albumPhotosKey + fileName;
        console.log(photoKey);

        s3.upload({
            Key: photoKey,
            Body: file,
            ACL: 'public-read',
            Metadata: {
                'userid': userName,
                'description': description,
                'tag1': taglist[0],
                'tag2': taglist[1],
                'tag3': taglist[2],
                'tag4': taglist[3],
                'tag5': taglist[4],
                'title': title
            }
        }, function (err, data) {
            if (err) {
                $('#photoupload-body').html('<span style="color: red; "><b>Error Uploading Photo!</b></span>');
                return
            }
            $('#photoupload-body').html('<span style="color: green; "><b>Photo Uploaded Successfully</b></span>');
            $('#addphoto').hide();
            $('#tags-body').hide();
            $('#cancelphoto').text('OK');
        });
    }

    function pageReloadOnUploadSuccess() {
        var buttonText = $('#cancelphoto').text();
        if (buttonText && buttonText == "OK") {
            window.location.reload(true);
        }
    }

});