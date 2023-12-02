<?php

HttpMisc::allowMethods(['POST']);
  
session_start();
session_unset();        
session_destroy();

echo JsonHttp::okResp([
    "data" => [
        "loggedIn" => false,
    ],
]);

exit();
