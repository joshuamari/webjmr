<?php 
$servername = "localhost";
$username = "root";
$password = "";
try {
  $connwebjmr = new PDO("mysql:host=localhost;dbname=webjmrdb", $username, $password);
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
?>

