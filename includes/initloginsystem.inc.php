<?php

HttpMisc::allowMethods(['POST']);

$langs = HttpMisc::getAcceptedLanguages();

$msg = (new CreateTables)->createUserTable()
    ? "table created"
    : "table exists";

echo JsonHttp::okResp([
    "msg" => $msg,
    "langs" => $langs,
    "data" => ["loggedIn" => false],
]);

exit();
