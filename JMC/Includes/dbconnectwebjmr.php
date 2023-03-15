<?php 
$servername = "localhost";
$username = "root";
$password = "";
try {
  $connwebjmr = new PDO("mysql:host=localhost;dbname=webjmrdb", $username, $password);
  $defaultProjID=array();
  $dProjQ="SELECT * FROM projectstable WHERE fldDirect=0 AND fldDelete=0";
  $dProjStmt=$connwebjmr->query($dProjQ);
  if($dProjStmt->rowCount()>0){
    $dProjArr=$dProjStmt->fetchAll();
    foreach($dProjArr AS $dProj){
      array_push($defaultProjID,$dProj['fldID']);
    }
  }
  $leaveQ="SELECT fldID FROM projectstable WHERE fldProject='Leave'";
  $leaveStmt=$connwebjmr->query($leaveQ);
  $leaveID=$leaveStmt->fetchColumn();
  $solProjQ="SELECT fldID FROM projectstable WHERE fldProject='Development & Analysis'";
  $solProjStmt=$connwebjmr->query($solProjQ);
  $solProjID=$solProjStmt->fetchColumn();
  $mngProjQ="SELECT fldID FROM projectstable WHERE fldProject='Management'";
  $mngProjStmt=$connwebjmr->query($mngProjQ);
  $mngProjID=$mngProjStmt->fetchColumn();
  $KDTWAccess=['SYS','ANA'];
  $managementPositions=['KDTP','SM','DM','AM','SSS','SSV'];
  $gods=['464','465','487'];
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
?>

