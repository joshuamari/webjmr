<?php
#region DB Connect
require_once '../../dbconn/dbconnectkdtph.php';
require_once '../../dbconn/dbconnectnew.php';
#endregion

#region Initialize Variable
if(!empty($_COOKIE["userID"])) {
  $userHash = $_COOKIE["userID"];
}
else {
  $msg["isSuccess"] = false;
  $msg["message"] = "Not logged in";
  die(json_encode($msg));
}
#endregion

#region MAIN QUERY
try{
  $loginQ = "SELECT `fldEmployeeNum` as `empID` FROM `kdtlogin` WHERE `fldUserHash` = :userHash";
  $loginStmt = $connkdt->prepare($loginQ);
  $loginStmt->execute([":userHash" => $userHash]);
  if($loginStmt->rowCount() > 0) {
    $userID = $loginStmt->fetchColumn();

    $empDeetsQ = "SELECT `el`.`id` AS empID, `el`.`firstname` AS `empFName`, `el`.`surname` AS `empSName`, `el`.`nickname` AS `empNName`, `el`.`date_hired` AS `empDateHired`, GROUP_CONCAT(DISTINCT `gl`.`abbreviation`) AS `empGroup`, `el`.`gender` AS `empGender`, `dl`.`acronym` AS `empPos`
    FROM `employee_list` AS `el` 
    LEFT JOIN `employee_group` AS `eg` ON `eg`.`employee_number` = `el`.`id`
    LEFT JOIN `group_list` AS `gl` ON `gl`.`id` = `eg`.`group_id`
    LEFT JOIN `designation_list` AS `dl` ON `dl`.`id` = `el`.`designation`
    WHERE `el`.`id` = :userID
    GROUP BY `el`.`id`";
    $empDeetsStmt = $connnew->prepare($empDeetsQ);
    $empDeetsStmt->execute([":userID" => $userID]);
    if($empDeetsStmt->rowCount() > 0) {
      $result = $empDeetsStmt->fetchAll();
      $msg['result'] = $result; 
      $msg['isSuccess'] = true;
      $msg['error'] = "Successfully retrieved";
    }
    else{
      $msg['isSuccess'] = false;
      $msg['error'] = "Failed to retrieve data";
    }
  }
  else {
    $msg['isSuccess'] = false;
    $msg['error'] = "No userID Found";
  }
  
} catch (Exception $e) {
	$msg["isSuccess"] = false;
	$msg['error'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($msg);