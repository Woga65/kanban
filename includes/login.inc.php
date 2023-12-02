<?php

HttpMisc::allowMethods(['POST']);

// grab parameters
$params = JsonHttp::requestData();

$uid = $params->uid;
$pwd = $params->pwd;

// instantiate login controller class
$loginController = new LoginController($uid, $pwd);

// process login
$user = $loginController->login();

echo JsonHttp::okResp([
    "data" => [
        "loggedIn" => true,
        "userId" => $user["user_uid"],
        "userName" => $user["user_name"],
        "userEmail" => $user["user_email"],
        "userVerified" => $user["user_verified"] === 1 ? true : false,
        "userTimestamp" => $user["user_timestamp"],
    ]
]);

// end of login
exit();
