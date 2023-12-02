<?php
require_once "../classes/autoloader.class.php";
Autoloader::register();

$router = new Router();

$router->post('initloginsystem', '../includes/initloginsystem.inc.php');
$router->post('isloggedin', '../includes/isloggedin.inc.php');
$router->post('isverified', '../includes/isverified.inc.php');
$router->post('login', '../includes/login.inc.php');
$router->post('logout', '../includes/logout.inc.php');
$router->post('sessionexists', '../includes/sessionexists.inc.php');
$router->post('signup', '../includes/signup.inc.php');

$router->route();
exit();