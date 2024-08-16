<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "../../dbconn/dbconnectnew.php";
#endregion

// Employee Position
function getEmpPosition($empID) {
  global $connnew;
  $getDesigQ = "SELECT `acronym` FROM `employee_list` AS `el`
    INNER JOIN `designation_list` AS `dl` ON `dl`.`id` = `el`.`designation`
    WHERE `el`.`id` = :empID";
  $getDesigStmt = $connnew->prepare($getDesigQ);
  $getDesigStmt->execute([":empID" => $empID]);
  $empDesig = $getDesigStmt->fetchColumn();
  return $empDesig;
}

// Shared Project/s
function getSharedProjects($empID) {
  global $connwebjmr;
  $sharedProjects = "";
  $spQ = "SELECT * FROM `project_share` WHERE `fldEmployeeNum` = '$empID'";
  $spStmt = $connwebjmr->prepare($spQ);
  $spStmt->execute([]);
  if($spStmt->rowCount()>0){
      $spArr=$spStmt->fetchAll();
      $arrValues = array_column($spArr, "fldProject");
      $implodeString = implode("','",array_values($arrValues));
      $sharedProjects = "OR fldID IN ('" . $implodeString . "')";
  }
  return $sharedProjects;
}

// Management Project/s
function getManagementProjects() {
  global $connwebjmr;
  $mngProjQ = "SELECT fldID FROM projectstable WHERE fldProject='Management'";
  $mngProjStmt = $connwebjmr->prepare($mngProjQ);
  $mngProjStmt->execute([]);
  $mngProjID = $mngProjStmt->fetchColumn();
  return $mngProjID;
}

// Solution Project/s
function getSolutionProjects() {
  global $connwebjmr;
  $solProjQ = "SELECT fldID FROM projectstable WHERE fldProject = 'Development, Analysis & IT'";
  $solProjStmt = $connwebjmr->prepare($solProjQ);
  $solProjStmt->execute([]);
  $solProjID = $solProjStmt->fetchColumn();
  return $solProjID;
}

function getGroup($grpNum) {
  global $connnew;
  $getGroupQ = "SELECT `abbreviation` FROM `group_list` WHERE `id` = :grpNum";
  $getGroupStmt = $connnew->prepare($getGroupQ);
  $getGroupStmt->execute([":grpNum" => $grpNum]);
  $grpAbbr = $getGroupStmt->fetchColumn();
  return $grpAbbr;
}
