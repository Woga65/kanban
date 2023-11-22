<?php
require_once "../classes/autoloader.class.php";
Autoloader::register();


switch($_SERVER['REQUEST_METHOD']) {

    case("OPTIONS"):                                        // Allow preflighting to take place.
        header("Access-Control-Allow-Methods: POST");
        header("Access-Control-Allow-Headers: content-type");
        exit;


    case("POST"):
        $session = new SessionController();
        $isValid = $session->updateSessionState();

        echo $isValid
            ?   JsonHttp::okResp([
                    "data" => [
                        "loggedIn" => true,
                        "userId" => $_SESSION["user_uid"],
                        "userName" => $_SESSION["user_name"],
                        "userEmail" => $_SESSION["user_email"],
                        "userVerified" => $_SESSION["user_verified"] === 1 ? true : false,
                        "userTimestamp" => $_SESSION["user_timestamp"],
                    ]
                ])
            :   JsonHttp::okResp([
                    "data" => ["loggedIn" => false]
                ]);

        exit();


    default:                                                // Reject any non POST or OPTIONS requests.
        header("Allow: POST", true, 405);
        exit;
} 