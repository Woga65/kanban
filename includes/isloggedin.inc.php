<?php

HttpMisc::allowMethods(['POST']);

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
