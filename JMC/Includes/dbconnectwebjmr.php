<?php 
$servername = "localhost";
$username = "root";
$password = "";
try {
  $connwebjmr = new PDO("mysql:host=localhost;dbname=webjmrdb", $username, $password);
  $defaultProjID=['1','3','4','5'];
  $KDTWAccess=['SYS','IT','ADM','ACT'];
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
?>

