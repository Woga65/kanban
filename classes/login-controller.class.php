<?php

class LoginController extends SessionController {

    private $uid;
    private $pwd;

    public function __construct($uid, $pwd)
    {
        $this->uid = $uid;
        $this->pwd = $pwd;

        if ($this->invalidParameters()) {
            exit();
        }
    }


    public function login()
    {
        if (!$this->userExists($this->uid, $this->uid)) {
            echo JsonHttp::errResp("No such user", ["fields" => ["uid"]]);
            exit();
        }

        if (!password_verify($this->pwd, $this->readRow['user_pwd'])) {
            echo JsonHttp::errResp("Password incorrect", ["fields" => ["pwd"]]);
            exit();
        }

        $this->startUserSession();
        return $this->readRow;
    }


    public function logout()
    {
        $this->readRow = [];
        $this->deleteUserSession();
    }


    private function invalidParameters()
    {
        if (empty($this->uid)) {
            echo JsonHttp::errResp("User id required", ["fields" => ["uid"]]);
            return true;
        }
        if (empty($this->pwd)) {
            echo JsonHttp::errResp("Password required", ["fields" => ["pwd"]]);
            return true;
        }
        if ($this->invalidUserId()) {
            echo JsonHttp::errResp("Invalid user id", ["fields" => ["uid"]]);
            return true;
        }
    }


    private function invalidUserId() {
        return !preg_match("/^[a-zA-Z0-9]*$/", $this->uid) && !filter_var($this->uid, FILTER_VALIDATE_EMAIL);
    }
}