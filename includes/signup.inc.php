<?php

HttpMisc::allowMethods(['POST']);

// grab parameters
$params = JsonHttp::requestData();

$uid = $params->uid;
$name = $params->name;
$email = $params->email;
$pwd = $params->pwd;
$pwdRepeat = $params->pwdrepeat;

// instantiate signup class
$signupController = new SignupController($uid, $name, $email, $pwd, $pwdRepeat);

// process signup
$signupController->signup();
echo JsonHttp::okResp([]);

// end of signup processing
exit();
