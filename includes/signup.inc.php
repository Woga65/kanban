<?php
require_once "../classes/autoloader.class.php";
Autoloader::register();


switch($_SERVER['REQUEST_METHOD']) {

    case("OPTIONS"):                                        // Allow preflighting to take place.
        header("Access-Control-Allow-Methods: POST");
        header("Access-Control-Allow-Headers: content-type");
        exit;


    case("POST"):                                           // Perform signup
        // grab parameters
        $json = file_get_contents('php://input');
        $params = json_decode($json);

        if ($params) {
            $uid = $params->uid;
            $name = $params->name;
            $email = $params->email;
            $pwd = $params->pwd;
            $pwdRepeat = $params->pwdrepeat;
        } else {
            header($_SERVER['SERVER_PROTOCOL'] . " 500 Internal Server Error", true, 500);  // no valid json
            exit();
        }

        // instantiate signup class
        $signupController = new SignupController($uid, $name, $email, $pwd, $pwdRepeat);

        // process signup
        $signupController->signup();
        echo JsonHttp::okResp([]);

        // end of signup processing
        exit();


    default:                                                // Reject any non POST or OPTIONS requests.
        header("Allow: POST", true, 405);
        exit;
} 