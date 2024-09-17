<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "../../dbconn/dbconnectnew.php";
require_once "../../dbconn/dbconnectkdtph.php";
#endregion

// Default Values
$KDTWAccess = ['SYS', 'ANA', 'IT'];
$managementPositions = ['KDTP', 'SM', 'DM', 'AM', 'SSS', 'SSV', 'IT-SV', 'CTE', 'GM'];
$devs = ['464', '510', '487'];
$noMoreInputItemOfWorks = ['6', '10', '15', '17', '19', '21'];

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

function getTrainProjID() {
  global $connwebjmr;
  $trainProjQ = "SELECT fldID FROM projectstable WHERE fldProject='Training'";
  $trainProjStmt = $connwebjmr->prepare($trainProjQ);
  $trainProjStmt->execute([]);
  $trainProjID = $trainProjStmt->fetchColumn();
  return $trainProjID;
}

function getLeaveID() {
  global $connwebjmr;
  $leaveQ = "SELECT fldID FROM projectstable WHERE fldProject='Leave'";
  $leaveStmt = $connwebjmr->prepare($leaveQ);
  $leaveStmt->execute([]);
  $leaveID = $leaveStmt->fetchColumn();
  return $leaveID;
}

function getDefaults() {
  global $connwebjmr;
  $defaults = array();
  $defaultsQ = "SELECT `fldId` FROM `projectstable` WHERE fldDirect = 0 AND fldDelete = 0";
  $defaultStmt = $connwebjmr->prepare($defaultsQ);
  $defaultStmt->execute([]);
  $arrResult = $defaultStmt->fetchAll();
    foreach($arrResult as $res) {
      $defaults[] = (int)$res['fldId'];
    }
  return $defaults;
}

function getkiaProjID() {
  global $connwebjmr;
  $kiaProjQ = "SELECT fldID FROM projectstable WHERE fldProject = 'KDT Internal Activities'";
  $kiaProjStmt = $connwebjmr->prepare($kiaProjQ);
  $kiaProjStmt->execute([]);
  $kiaProjID = $kiaProjStmt->fetchColumn();
  return $kiaProjID;
}

function getOneBUTrainerID() {
  global $connwebjmr;
  $obuTrainQ = "SELECT fldID FROM itemofworkstable WHERE fldItem='Trainer for One BU Participants'";
  $obuTrainStmt = $connwebjmr->prepare($obuTrainQ);
  $obuTrainStmt->execute([]);
  $oneBUTrainerID = $obuTrainStmt->fetchColumn();
  return $oneBUTrainerID;
}

function getOtherProjID() {
  global $connwebjmr;
  $otherProjQ = "SELECT fldID FROM projectstable WHERE fldProject='Business Trip & Other'";
  $otherProjStmt = $connwebjmr->prepare($otherProjQ);
  $otherProjStmt->execute([]);
  $otherProjID = $otherProjStmt->fetchColumn();
  return $otherProjID;
}

function checkAccess($empNum) {
  global $connkdt;
  $access = FALSE;
  $permissionID = 50;
  $userQ = "SELECT COUNT(*) FROM user_permissions WHERE permission_id = :permissionID AND fldEmployeeNum = :empID";
  $userStmt = $connkdt->prepare($userQ);
  $userStmt->execute([":empID" => $empNum, ":permissionID" => $permissionID]);
  $userCount = $userStmt->fetchColumn();
  if ($userCount > 0) {
      $access = TRUE;
  }
  return $access;
}

// echo json_encode($global_var);