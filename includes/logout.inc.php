<?php

session_start();
session_unset();
session_destroy();

if (isset($_POST['logout-submit'])) {
    header("Location: ../index.html?loggedout=true");
} else {
    echo '{ "err": "", "ok": true, "data":{ "loggedIn": false } }';
}
exit(); 
