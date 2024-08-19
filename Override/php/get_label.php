<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion

#region Initialize Variable
if(!empty($_POST['itemID'])){
    $itemID = $_POST['itemID'];
}
else{
  $msg['isSuccess'] = FALSE;
  $msg['error'] = "Item ID Missing";
  die(json_encode($msg));
}
#endregion

#region MAIN QUERY
try {
  $labelQ = "SELECT fldLabel FROM itemlabels WHERE fldItem = :itemID";
  $labelStmt = $connwebjmr->prepare($labelQ);
  $labelStmt->execute([":itemID" => $itemID]);
  $result = ($labelStmt->rowCount() > 0) ? $labelStmt->fetchColumn() : "";
  $msg['result'] = $result;
  $msg['isSuccess'] = TRUE;
  $msg['error'] = "Successfully retrieved";
} catch (Exception $e) {
	$msg["isSuccess"] = false;
	$msg['error'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($msg);