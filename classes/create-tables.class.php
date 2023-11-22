<?php

class CreateTables extends Dbh {

    public function createUserTable() {
        $db = $this->connect();
        $result = $db->query("SHOW TABLES LIKE 'kb_users'");
        $exists = $result !== false && $result->rowCount() > 0;
        
        if (!$exists) {
            $sql = "CREATE TABLE IF NOT EXISTS `kb_users` (
                `user_id` int(11) NOT NULL AUTO_INCREMENT,
                `user_uid` tinytext CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
                `user_email` tinytext NOT NULL,
                `user_pwd` longtext CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
                `user_vkey` longtext CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
                `user_verified` tinyint(1) NOT NULL DEFAULT 0,
                `user_timestamp` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
                `user_name` tinytext NOT NULL,
                PRIMARY KEY (`user_id`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8;";
            $result = $db->query($sql);
            if (!$result) {
                echo JsonHttp::errResp("SQL error (" . $db->errorInfo()[0] . "): " . $db->errorInfo()[2]);
                exit();
            }
        }
        return !$exists;
    }
}