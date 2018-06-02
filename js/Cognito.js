(function (win, CognitoUserPool) {

    var CognitoUserPool = window.AmazonCognitoIdentity.CognitoUserPool,
        AWSCognito = window.AWSCognito,
        CognitoIdentityServiceProvider = AWSCognito.CognitoIdentityServiceProvider,
        CognitoUserAttribute = CognitoIdentityServiceProvider.CognitoUserAttribute,
        CognitoUser = CognitoIdentityServiceProvider.CognitoUser,
        AuthenticationDetails = CognitoIdentityServiceProvider.AuthenticationDetails,
        UserPool = new CognitoUserPool({
            UserPoolId: "us-east-1_SDBkZhuhS",//window.USER_POOL_ID, // Your user pool id here
            ClientId: "1024n0vvdvpul68t4tqn2ae4sj",//window.CLIENT_ID, // Your client id here
        }),
        User;

    function signUp(userid, email, password, about, country, dob, gender) {
        var attributes = [new CognitoUserAttribute({Name: 'email', Value: email}),
            new CognitoUserAttribute({Name: 'custom:about', Value: about}),
            new CognitoUserAttribute({Name: 'custom:dob', Value: dob}),
            new CognitoUserAttribute({Name: 'custom:gender', Value: gender}),
            new CognitoUserAttribute({Name: 'custom:country', Value: country})];

        return new Promise(function (resolve, reject) {
            UserPool.signUp(
                userid,
                password,
                attributes,
                null,
                function (err, result) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    User = result.user;
                    resolve(User);
                    return;
                }
            )
        });
    }

    function confirm(username, code) {
        User = new CognitoUser({
            Username: username,
            Pool: UserPool,
        });
        return new Promise(function (resolve, reject) {
            User.confirmRegistration(code, true, function (err, result) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
                return;
            });
        })
    }

    function resendConfirmationCode() {
        return new Promise(function (resolve, reject) {
            User.resendConfirmationCode(function (err, result) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }

    function logIn(username, password) {
        var authenticationDetails = new AuthenticationDetails({
            Username: username,
            Password: password,
        });
        User = new CognitoUser({
            Username: username,
            Pool: UserPool,
        });
        return new Promise(function (resolve, reject) {
            User.authenticateUser(authenticationDetails, {
                onSuccess: resolve,
                onFailure: reject,
            })
        })
    }

    function getSession() {
        User || (User = UserPool.getCurrentUser());
        return new Promise(function (resolve, reject) {
            if (User === null) {
                reject('No current session found.');
                return;
            }
            User.getSession(function (err, session) {
                if (err) {
                    reject(err);
                    return;
                }
                if (session.isValid() === false) {
                    reject('Session is invalid');
                }

                // Add the User's Id Token to the Cognito credentials login map.
                AWS.config.region = 'us-east-1';
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: 'us-east-1:80a04569-cb3e-4321-bbd3-2049ac9c23cc',
                    Logins: {
                        'cognito-idp.us-east-1.amazonaws.com/us-east-1_SDBkZhuhS': session.getIdToken().getJwtToken()
                    }
                });
                //console.log("reached role auth");

                //console.log("token: " + session.getIdToken().getJwtToken())
                sessionStorage.setItem("AccessToken", session.getIdToken().getJwtToken())
                resolve();
                return;
            })
        })
    }

    function isAuthenticated() {
        return getSession();
    }

    function isNotAuthenticated() {
        return new Promise(function (resolve, reject) {
            getSession().then(reject).catch(resolve);
        })
    }

    function getUserPool() {
        return UserPool;
    }
    function getUser() {
        return (
            getSession()
                .then(function () {
                    // NOTE: getSession must be called to authenticate user before
                    // calling getUserAttributes
                    return new Promise(function (resolve, reject) {
                        User.getUserAttributes(function (err, attributes) {
                            if (err) {
                                reject(err);
                                return
                            }
                            // Reduce the attributes into a simpler object.
                            resolve(attributes.reduce(function (acc, attr) {
                                var attribute = {};
                                attribute[attr.getName()] = attr.getValue();
                                return Object.assign(acc, attribute);
                            }, {}));
                            return;
                        });
                    })
                })
        )
    }

    function getUserName() {
        return User.getUsername();
    }

    function signOut() {
        User || (User = UserPool.getCurrentUser())
        if (!User) {
            return Promise.reject('Current user session not found');
        }
        sessionStorage.clear();
        return Promise.resolve(User.signOut());
    }

    window.Cognito = Object.freeze({
        signUp: signUp,
        confirm: confirm,
        logIn: logIn,
        resendConfirmationCode: resendConfirmationCode,
        getSession: getSession,
        getUser: getUser,
        getUserName: getUserName,
        getUserPool: getUserPool,
        signOut: signOut,
        isAuthenticated: isAuthenticated,
        isNotAuthenticated: isNotAuthenticated,
    })
})(window)
