<?php

class Autoloader {
    private function __construct() {}

    public static function register() {
        spl_autoload_register(function($className) {
            switch ($className) {
                case('SignupController'):
                    $fileName = 'signup-controller';
                    break;                
                case('LoginController'):
                    $fileName = 'login-controller';
                    break;
                case('SessionController'):
                    $fileName = 'session-controller';
                    break;
                case('CreateTables'):
                    $fileName = 'create-tables';
                    break;
                case('EmailAuth'):
                    $fileName = 'email-auth';
                    break;
                case('JsonHttp'):
                    $fileName = 'json-http';
                    break;
                case('HttpMisc'):
                    $fileName = 'http-misc';
                    break;
                default:
                    $fileName = strtolower($className);
            }
            include __DIR__ . "/$fileName.class.php";
        });
    }
}