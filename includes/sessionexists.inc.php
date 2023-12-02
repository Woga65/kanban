<?php

HttpMisc::allowMethods(['POST']);

echo JsonHttp::okResp([
    "data" => [
        "loggedIn" => (new SessionController())->sessionExists(),
    ]
]);
exit();
