<?php 
$servername = "localhost";
$username = "root";
$password = "";
try {
  $connwebjmr = new PDO("mysql:host=localhost;dbname=webjmrdb", $username, $password);
  $defaultProjID=['1','3','4','5'];
  $KDTWAccess=['SYS','IT','ADM','ACT'];
  date_default_timezone_set('Asia/Manila');
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
?>

