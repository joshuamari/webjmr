<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "./global.php";
#endregion

#region Initialize Variable
if(!empty($_POST['projID'])){
  $projID = $_POST['projID'];
}
else{
  $msg['isSuccess'] = FALSE;
  $msg['error'] = "Project ID Missing";
  die(json_encode($msg));
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
    $result = $typeStmt->fetchAll();
    $msg['result'] = $result;
    $msg['isSuccess'] = TRUE;
    $msg['error'] = "Successfully retrieved";
  } else{
      $msg['isSuccess'] = FALSE;
      $msg['error'] = "Failed to retrieve data";
    }
  
} catch (Exception $e) {
	$msg["isSuccess"] = false;
	$msg['error'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($msg);