<?php
#region DB Connect
require_once "../../dbconn/dbconnectkdtph.php";
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion

#region Initialize Variable
// $selDate = date("Y-m-d");
$selDate = (!empty($_POST['selDate'])) ? $_POST['selDate'] : date("Y-m-d");
if(date('N', strtotime($selDate)) >= 6){
  $isWorkday = FALSE;
}
$selLoc = (!empty($_POST['selLoc'])) ? $_POST['selLoc'] : 1;
#endregion

#region Additional Conditions
$getLocQ = "SELECT `fldLocation` from `dispatch_locations` WHERE `fldID` = :locID";
$getLocStmt = $connwebjmr->prepare($getLocQ);
$getLocStmt->execute([":locID" => $selLoc]);
$selLoc = $getLocStmt->fetchColumn();
#endregion

#region Main Query
try {
  $workDayQ = "SELECT `fldHolidayType` 
               FROM `kdtholiday` 
               WHERE `fldDate` = :selDate AND `fldLocation` = :selLoc";
  $workDayStmt = $connkdt->prepare($workDayQ);
  $workDayStmt->execute([":selDate" => $selDate, ":selLoc" => $selLoc]);
  $workDayType = $workDayStmt->fetchColumn();
  if($workDayStmt->rowCount() > 0) {
    if($workDayType != 2) {
      $isWorkday = FALSE;
    }
    else{
      $isWorkday = TRUE;
    }
    $result['result'] = $isWorkday;
    $result['isSuccess'] = TRUE;
    $result['message'] = "Successfully retrieved";
  } else{
    $result['result'] = TRUE;
    $result['isSuccess'] = FALSE;
    $result['message'] = "Failed to retrieve!";
  }
} catch (Exception $e) {
	$result["isSuccess"] = FALSE;
	$result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);