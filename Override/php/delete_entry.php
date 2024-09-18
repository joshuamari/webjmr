<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion

#region Initialize Variable
if(!empty($_POST['drID'])){
    $drID = $_POST['drID'];
} else {
  $result['isSuccess'] = FALSE;
  $result['message'] = "Daily Report ID Missing";
  die(json_encode($result));
}
#endregion

#region Main Query
try {
  $deleteQ = "DELETE FROM dailyreport WHERE fldID = :drID";
  $deleteStmt = $connwebjmr->prepare($deleteQ);
  $deleteStmt->execute([":drID"=>$drID]);
  if($deleteStmt->rowCount() > 0) {
    $result['isSuccess'] = TRUE;
    $result['message'] = "Successfully Deleted!";
  }
  else{
    $result['isSuccess'] = FALSE;
    $result['message'] = "No Existing ID";
  }
} catch (Exception $e) {
  $result["isSuccess"] = FALSE;
  $result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);