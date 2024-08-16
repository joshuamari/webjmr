<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion

#region Initialize Variable
if(!empty($_POST['towID'])) {
    $towID = $_POST['towID'];
}
else{
  $msg['isSuccess'] = FALSE;
  $msg['error'] = "Type of Work Missing";
  die(json_encode($msg));
}
#endregion

#region MAIN QUERY
try {
  $towQ = "SELECT fldTOWDesc 
          FROM typesofworktable 
          WHERE fldID = :towID";
  $towStmt = $connwebjmr->prepare($towQ);
  $towStmt->execute([":towID" => $towID]);
  if($towStmt->rowCount() > 0) {
    $result = $towStmt->fetchColumn();
    $msg['result'] = $result;
    $msg['isSuccess'] = TRUE;
    $msg['error'] = "Successfully retrieved";
  }
  else{
    $msg['isSuccess'] = FALSE;
    $msg['error'] = "Failed to retrieve data";
  }
} catch (Exception $e) {
	$msg["isSuccess"] = false;
	$msg['error'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($msg);