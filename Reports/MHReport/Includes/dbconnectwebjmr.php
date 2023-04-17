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
  $mngProjQ="SELECT fldID FROM projectstable WHERE fldProject='Management'";
  $mngProjStmt=$connwebjmr->query($mngProjQ);
  $mngProjID=$mngProjStmt->fetchColumn();
  $gods=['464','465','487'];
  $kdtWholeItems=['1','2','16','18','20'];
  $khiWholeItems=['3','4','5','12','14'];
  $halfItems=['7','8','9','11','13','22','23','24'];
  $itMembers=array();
  $itQ="SELECT fldEmployeeNum FROM emp_prof WHERE fldGroup='IT' AND fldActive=1";
  $itStmt=$connkdt->query($itQ);
  $itArr=$itStmt->fetchAll();
  foreach($itArr AS $its){
    array_push($itMembers,$its['fldEmployeeNum']);
  }
  $mgaSM=array();
  $smQ="SELECT fldEmployeeNum FROM emp_prof WHERE fldDesig IN ('SM','KDTP') AND fldActive=1";
  $smStmt=$connkdt->query($smQ);
  $smArr=$smStmt->fetchAll();
  foreach($smArr AS $sms){
    array_push($mgaSM,$sms['fldEmployeeNum']);
  }
  $reportAllGroupAccess=[];
  $reportAllGroupAccess=array_merge($gods,$itMembers,$mgaSM);
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
?>

