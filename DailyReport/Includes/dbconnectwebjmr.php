<?php 
$servername = "localhost";
$username = "root";
$password = "";
try {
  $connwebjmr = new PDO("mysql:host=localhost;dbname=webjmrdb", $username, $password);
  
  date_default_timezone_set('Asia/Manila');
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
?>

