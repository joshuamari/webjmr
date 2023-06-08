<?php 
$servername = "localhost";
$username = "root";
$password = "";
try {
  $connkdt = new PDO("mysql:host=localhost;dbname=kdtphdb", $username, $password);
  $devs=["464","465","487"];
  $sys=array();
  $sysQ="SELECT fldEmployeeNum FROM emp_prof WHERE fldGroup='SYS' AND fldActive=1 AND fldEmployeeNum NOT IN (464,465,487,466)";
  $sysStmt=$connkdt->query($sysQ);
  $sysArr=$sysStmt->fetchAll();
  foreach($sysArr AS $syss){
    array_push($sys,$syss['fldEmployeeNum']);
  }
  $itMembers=array();
  $itQ="SELECT fldEmployeeNum FROM emp_prof WHERE fldGroup='IT' AND fldActive=1";
  $itStmt=$connkdt->query($itQ);
  $itArr=$itStmt->fetchAll();
  foreach($itArr AS $its){
    array_push($itMembers,$its['fldEmployeeNum']);
  }
  $allAccess=array();
  $allAccess=array_merge($devs,$itMembers,$sys);
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
?>

