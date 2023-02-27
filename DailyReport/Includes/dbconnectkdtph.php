<?php 
$servername = "localhost";
$username = "root";
$password = "";
try {
  $connkdt = new PDO("mysql:host=localhost;dbname=kdtphdb", $username, $password);
  
  date_default_timezone_set('Asia/Manila');
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
if(isset($_COOKIE["userID"]))
$userHash=$_COOKIE["userID"];
else
$userHash='';


$kdtPresidentQ="SELECT DISTINCT fldEmployeeNum FROM emp_prof WHERE fldDesig='KDTP' AND fldActive=1";
$kdtPresidentStmt=$connkdt->query($kdtPresidentQ);
$kdtPresident=$kdtPresidentStmt->fetchColumn();

$kdtAdmin="121"; //MAAM ARLENE SA NGAYON
?>

