<?php

class SessionController extends User {

    public function sessionExists()
    {
        session_start();
        return isset($_SESSION['user_id']);
    }


    public function updateSessionState()
    {
        session_start();
        if (!isset($_SESSION['user_id'])) {
            return false;
        }
        if (!$this->userExists($_SESSION['user_uid'], $_SESSION['user_email'])) {
            $this->deleteUserSession();
            return false;
        }

        $this->updateUserSession();
        return true;
    }


    protected function startUserSession()
    {
        session_start();
        $this->updateUserSession();
    }


    protected function deleteUserSession()
    {
        session_unset();
        session_destroy();
    }


    protected function updateUserSession()
    {
        $_SESSION['user_id'] = $this->readRow['user_id'];
        $_SESSION['user_uid'] = $this->readRow['user_uid'];
        $_SESSION['user_name'] = $this->readRow['user_name'];
        $_SESSION['user_email'] = $this->readRow['user_email'];
        $_SESSION['user_vkey'] = $this->readRow['user_vkey'];
        $_SESSION['user_verified'] = $this->readRow['user_verified'];
        $_SESSION['user_timestamp'] = $this->readRow['user_timestamp'];
    }
}