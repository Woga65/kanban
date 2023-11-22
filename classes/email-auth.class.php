<?php

class EmailAuth {
    private function __construct() {}

    public static function sendVerification($email, $name, $vkey) {
        $recipient = $email;
        $subject = "your registration: Kanban Project";
        $headers = "From: Kanban <noreply@ws-kanban.de>";
        $message = "Hi $name,\r\n \r\nto complete the registration process, please follow the link below: \r\n \r\n";
        $message = $message . "https://wolfgang-siebert.de/projects/kanban/verify.php?vkey=$vkey";                           
        mail($recipient, $subject, $message, $headers);
        return true;
    }
}