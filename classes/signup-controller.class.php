<?php

class SignupController extends User {

    private $uid;
    private $name;
    private $email;
    private $pwd;
    private $pwdRepeat;

    public function __construct($uid, $name, $email, $pwd, $pwdRepeat)
    {
        $this->uid = $uid;
        $this->name = $name;
        $this->email = $email;
        $this->pwd = $pwd;
        $this->pwdRepeat = $pwdRepeat;

        if ($this->invalidParameters()) {
            exit();
        }
    }


    public function signup()
    {
        $vkey = $this->addUser($this->uid, $this->name, $this->email, $this->pwd);
        EmailAuth::sendVerification($this->email, $this->name, $vkey);
        
        return true;
    }


    private function invalidParameters()
    {
        if ($this->emptyParameters()) {
            echo JsonHttp::errResp("Required field(s) empty");
            return true;
        }
        if ($this->invalidUserId() && $this->invalidEmail()) {
            echo JsonHttp::errResp("Invalid user id / email", ["fields" => ["uid", "email"]]);
            return true;
        }
        if ($this->invalidEmail()) {
            echo JsonHttp::errResp("Invalid email address", ["fields" => ["email"]]);
            return true;
        }
        if ($this->invalidUserId()) {
            echo JsonHttp::errResp("Invalid user id", ["fields" => ["uid"]]);
            return true;
        }
        if ($this->pwdNotMatch()) {
            echo JsonHttp::errResp("Passwords do not match", ["fields" => ["pwd", "pwdrepeat"]]);
            return true;
        }
        if ($this->userExists($this->uid, $this->email)) {
            echo JsonHttp::errResp("User exists", ["fields" => ["uid", "email"]]);
            return true;
        }
        return false;
    }


    private function emptyParameters() {
        return (empty($this->uid) || empty($this->name) || empty($this->email) || empty($this->pwd) || empty($this->pwdRepeat));
    }


    private function invalidEmail() {
        return !filter_var($this->email, FILTER_VALIDATE_EMAIL);
    }


    private function invalidUserId() {
        return !preg_match("/^[a-zA-Z0-9]*$/", $this->uid);
    }


    private function pwdNotMatch() {
        return $this->pwd !== $this->pwdRepeat;
    }

}