<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "./global_functions.php";
#endregion

#region MAIN QUERY
try{
  $defaultsQ = "SELECT `fldId` FROM `projectstable` WHERE fldDirect = 0 AND fldDelete = 0";
  $defaultStmt = $connwebjmr->prepare($defaultsQ);
  $defaultStmt->execute([]);
  if ($defaultStmt->rowCount() > 0) {
    $arrResult = $defaultStmt->fetchAll();
    foreach($arrResult as $res) {
      $result['result'][] = (int)$res['fldId'];
    }
    $result['isSuccess'] = TRUE;
    $result['message'] = "Successfully retrieved";
  }
  else{
    $result['isSuccess'] = FALSE;
    $result['message'] = "Failed to retrieve data";
  }
} catch (Exception $e) {
	$result["isSuccess"] = FALSE;
	$result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);