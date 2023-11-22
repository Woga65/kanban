<?php
require_once "../classes/autoloader.class.php";
Autoloader::register();


switch($_SERVER['REQUEST_METHOD']) {

    case("OPTIONS"):                                        // Allow preflighting to take place.
        header("Access-Control-Allow-Methods: POST");
        header("Access-Control-Allow-Headers: content-type");
        exit;


    case("POST"):                                           // Perform login
        // grab parameters
        $json = file_get_contents('php://input');
        $params = json_decode($json);

        if ($params) {
            $uid = $params->uid;
            $pwd = $params->pwd;
        } else {
            header($_SERVER['SERVER_PROTOCOL'] . " 500 Internal Server Error", true, 500);  // no valid json
            exit();
        }

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


    default:                                                // Reject any non POST or OPTIONS requests.
        header("Allow: POST", true, 405);
        exit;
} 