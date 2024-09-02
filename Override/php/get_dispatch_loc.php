<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion

#region main query
try {
  $locationQ = "SELECT `fldID` AS `id`, `fldLocation` AS `location` FROM `dispatch_locations`";
  $locationStmt = $connwebjmr->prepare($locationQ);
  $locationStmt->execute([]);
  if($locationStmt->rowCount() > 0){
    $location = $locationStmt->fetchAll();
    $msg['result'] = $location;
    $msg['error'] = "Locations successfully retrieved!";
    $msg['isSuccess'] = true;
  }
  else{
    $msg['error'] = "No Locations retrieved!";
    $msg['isSuccess'] = false;
  }
} catch (Exception $e) {
	$msg["isSuccess"] = false;
	$msg['error'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($msg);