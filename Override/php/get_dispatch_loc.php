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
    $result['result'] = $locationStmt->fetchAll();
    $result['isSuccess'] = TRUE;
    $result['message'] = "Locations successfully retrieved!";
  }
  else{
    $result['isSuccess'] = FALSE;
    $result['message'] = "No Locations retrieved!";
  }
} catch (Exception $e) {
	$result["isSuccess"] = FALSE;
	$result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);