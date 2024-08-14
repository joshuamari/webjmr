<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "../../dbconn/dbconnectnew.php";
#endregion

// Shared Project/s
function getSharedProjects($empID) {
  global $connkdt;
  $sharedProjects = "";
  $spQ = "SELECT * FROM `project_share` WHERE `fldEmployeeNum` = '$empID'";
  $spStmt = $connkdt->prepare($spQ);
  $spStmt->execute([]);
  if($spStmt->rowCount()>0){
      $spArr=$spStmt->fetchAll();
      $arrValues = array_column($spArr, "fldProject");
      $implodeString = implode("','",array_values($arrValues));
      $sharedProjects = "OR fldID IN ('" . $implodeString . "')";
  }
  return $sharedProjects;
}
