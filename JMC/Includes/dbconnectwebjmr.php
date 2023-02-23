<?php 
$servername = "localhost";
$username = "root";
$password = "";
try {
  $connwebjmr = new PDO("mysql:host=localhost;dbname=webjmrdb", $username, $password);
  $defaultProjID=['1','2','3','4','5'];
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
?>

