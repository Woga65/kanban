<?php

class User extends Dbh {

    protected $readRow = [];


    protected function userExists($uid, $email)
    {
        $sql = 'SELECT * FROM kb_users WHERE user_uid=? OR user_email=? LIMIT 1;';

        $stmt = $this
            ->connect()
            ->prepare($sql);

        if (!$stmt->execute(array($uid, $email))) {
            $stmt = null;
            echo JsonHttp::errResp("stmtfailed: Check exists");
            exit();
        }

        $rowCount = $stmt->rowCount();
        $this->readRow = $rowCount > 0 ? $stmt->fetch(PDO::FETCH_ASSOC) : [];

        return $rowCount > 0;
    }


    protected function addUser($uid, $name, $email, $pwd)
    {
        $hashedpwd = password_hash($pwd, PASSWORD_DEFAULT);
        $vkey = password_hash(date('Y-m-d H:i:s') . $uid, PASSWORD_DEFAULT);
        $values = array($uid, $name, $email, $hashedpwd, $vkey, 0);

        $sql = "INSERT INTO kb_users (user_uid, user_name, user_email, user_pwd, user_vkey, user_verified) VALUES (?, ?, ?, ?, ?, ?);";

        $stmt = $this
            ->connect()
            ->prepare($sql);

        if (!$stmt->execute($values)) {
            $stmt = null;
            echo JsonHttp::errResp("stmtfailed: Signup user");
            exit();
        }

        return $vkey;
    }


    public function verifyUser($vkey)
    {
        $sql = 'SELECT user_name, user_vkey, user_verified FROM kb_users WHERE user_verified = 0 AND user_vkey = ? LIMIT 1;';

        $stmt = $this
            ->connect()
            ->prepare($sql);

        if (!$stmt->execute(array($vkey))) {
            $stmt = null;
            echo JsonHttp::errResp("stmtfailed: Verify user select");
            exit();
        }

        if ($stmt->rowCount() !== 1) {
            return false;
        }

        $this->readRow = $stmt->fetch(PDO::FETCH_ASSOC);

        $sql ="UPDATE kb_users SET user_verified = 1 WHERE user_vkey = ? LIMIT 1;";

        $stmt = $this
            ->connect()
            ->prepare($sql);

        if (!$stmt->execute(array($vkey))) {
            $stmt = null;
            echo JsonHttp::errResp("stmtfailed: Verify user update");
            exit();
        }
    
        return $this->readRow['user_name'];
    }
}