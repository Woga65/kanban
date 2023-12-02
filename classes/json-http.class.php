<?php

class JsonHttp {
    private function __construct() {}

    public static function okResp(array $result) {
        self::jsonHeader();
        return json_encode(
            [
                "err" => "",
                "ok" => true,
            ] 
            + $result
        );
    }


    public static function errResp(string $err, array $result = []) {
        self::jsonHeader();
        return json_encode(
            [
                "err" => $err,
                "ok" => false,
            ] 
            + $result
        );
    }


    private static function jsonHeader() {
        header("Content-Type: application/json");
    }


    public static function requestData() {
        $json = file_get_contents('php://input');
        $params = json_decode($json);
        if (!$params) {
            header($_SERVER['SERVER_PROTOCOL'] . " 500 Internal Server Error", true, 500);  // no valid json
            exit();
        }
        return $params;
    }
    
}