<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "./global.php";
#endregion

#region MAIN QUERY
try{
  $defaultsQ = "SELECT `fldId` FROM `projectstable` WHERE fldDirect = 0 AND fldDelete = 0";
  $defaultStmt = $connwebjmr->prepare($defaultsQ);
  $defaultStmt->execute([]);
  if ($defaultStmt->rowCount() > 0) {
    $arrResult = $defaultStmt->fetchAll();
    foreach($arrResult as $res) {
      $msg['result'][] = (int)$res['fldId'];
    }
    $msg['isSuccess'] = true;
    $msg['error'] = "Successfully retrieved";
  }
  else{
    $msg['isSuccess'] = false;
    $msg['error'] = "Failed to retrieve data";
  }
} catch (Exception $e) {
	$msg["isSuccess"] = false;
	$msg['error'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($msg);