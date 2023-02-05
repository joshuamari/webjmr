<?php 
$servername = "localhost";
$username = "root";
$password = "";
try {
  $connkdt = new PDO("mysql:host=localhost;dbname=kdtphdb", $username, $password);
  
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
?>

