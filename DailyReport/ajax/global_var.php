<?php

require_once "../../dbconn/dbconnectwebjmr.php";
require_once "../../dbconn/dbconnectnew.php";

$leaveQ = "SELECT fldID FROM projectstable WHERE fldProject='Leave'";
$leaveStmt = $connwebjmr->query($leaveQ);
$leaveID = $leaveStmt->fetchColumn();

$solProjQ = "SELECT fldID FROM projectstable WHERE fldProject='Development, Analysis & IT'";
$solProjStmt = $connwebjmr->query($solProjQ);
$solProjID = $solProjStmt->fetchColumn();

$mngProjQ = "SELECT fldID FROM projectstable WHERE fldProject='Management'";
$mngProjStmt = $connwebjmr->query($mngProjQ);
$mngProjID = $mngProjStmt->fetchColumn();

$otherProjQ = "SELECT fldID FROM projectstable WHERE fldProject='Business Trip & Other'";
$otherProjStmt = $connwebjmr->query($otherProjQ);
$otherProjID = $otherProjStmt->fetchColumn();

$kiaProjQ = "SELECT fldID FROM projectstable WHERE fldProject='KDT Internal Activities'";
$kiaProjStmt = $connwebjmr->query($kiaProjQ);
$kiaProjID = $kiaProjStmt->fetchColumn();

$trainProjQ = "SELECT fldID FROM projectstable WHERE fldProject='Training'";
$trainProjStmt = $connwebjmr->query($trainProjQ);
$trainProjID = $trainProjStmt->fetchColumn();

$obuTrainQ = "SELECT fldID FROM itemofworkstable WHERE fldItem='Trainer for One BU Participants'";
$obuTrainStmt = $connwebjmr->query($obuTrainQ);
$oneBUTrainerID = $obuTrainStmt->fetchColumn();

$KDTWAccess = ['SYS', 'ANA', 'IT'];
$managementPositions = ['KDTP', 'SM', 'DM', 'AM', 'SSS', 'SSV', 'IT-SV', 'CTE', 'GM'];
$gods = ['464', '510', '487'];
$noMoreInputItemOfWorks = ['6', '10', '15', '17', '19', '21'];
date_default_timezone_set('Asia/Manila');

function getGroup($grpNum) {
  global $connnew;
  $getGroupQ = "SELECT `abbreviation` FROM `group_list` WHERE `id` = :grpNum";
  $getGroupStmt = $connnew->prepare($getGroupQ);
  $getGroupStmt->execute([":grpNum" => $grpNum]);
  $grpAbbr = $getGroupStmt->fetchColumn();
  return $grpAbbr;
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

function checkAccess($empNum)
{
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