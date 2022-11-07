<?php
session_start();

if (!function_exists('file_put_contents')) {
   function file_put_contents($filename, $data)
   {
	if (($h = @fopen($filename, 'w')) === false) {
	   return false;
	}
	if (($bytes = @fwrite($h, $data)) === false) {
	   return false;
	}
	fclose($h);
	return $bytes;
   }
}

if (isset($_SESSION['user_id'])) {
    $backup = file_get_contents("smallest_backend_ever/database.bak.json");
    echo '{ "restoredBytes": "' . file_put_contents("smallest_backend_ever/database.json", $backup) . '"}';
}