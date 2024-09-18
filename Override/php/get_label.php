<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion

#region Initialize Variable
if(!empty($_POST['itemID'])){
    $itemID = $_POST['itemID'];
}
else{
  $result['isSuccess'] = FALSE;
  $result['message'] = "Item ID Missing";
  die(json_encode($result));
}
#endregion

#region MAIN QUERY
try {
  $labelQ = "SELECT fldLabel FROM itemlabels WHERE fldItem = :itemID";
  $labelStmt = $connwebjmr->prepare($labelQ);
  $labelStmt->execute([":itemID" => $itemID]);
  if($labelStmt->rowCount() > 0) {
    $result['result'] = $labelStmt->fetch();
    $result['isSuccess'] = TRUE;
    $result['message'] = "Successfully retrieved";
  } else {
    $result['isSuccess'] = FALSE;
    $result['message'] = "Failed to retrieve data";
  }
} catch (Exception $e) {
	$result["isSuccess"] = false;
	$result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);