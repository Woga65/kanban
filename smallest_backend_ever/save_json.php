<?php
session_start();

if (isset($_SESSION['user_id'])) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: *");

    $json = file_get_contents('php://input');
    if (strlen($json) > 100000) {
        die('Payload is too long (Max. 100000 characters).');
    }
    if (!isJson($json)) {
        exit();
    }
    else {
        $file = 'database.json';
        file_put_contents($file, $json);
    }
}

function isJson($str) {
    $j = json_decode($str);
    return $j !== false && !is_null($j) && $str != $j;
}
