<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "./global_functions.php";
#endregion

#region Initialize Variable
if(!empty($_POST['projID'])){
  $projID = $_POST['projID'];
}
else{
  $result['isSuccess'] = FALSE;
  $result['message'] = "Project ID Missing";
  die(json_encode($result));
}
$leaveID = getLeaveID();
$towType = ($projID == $leaveID) ? "0" : "1";
#endregion

#region MAIN QUERY
try {
  $typeQ = "SELECT `fldID` AS `id`, CONCAT(`fldCode`, ' - ', `fldTOW`) as `itemName` 
  FROM `typesofworktable` 
  WHERE `fldTOWType` = :towType AND fldActive = 1 ORDER BY fldPrio";
  $typeStmt = $connwebjmr->prepare($typeQ);
  $typeStmt->execute([":towType" => $towType]);
  if($typeStmt->rowCount() > 0) {
    $result['result'] = $typeStmt->fetchAll();
    $result['isSuccess'] = TRUE;
    $result['message'] = "Successfully retrieved";
  } else{
      $result['isSuccess'] = FALSE;
      $result['message'] = "Failed to retrieve data";
    }
  
} catch (Exception $e) {
	$result["isSuccess"] = FALSE;
	$result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);