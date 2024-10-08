<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion

#region Initialize Variable
if(!empty($_POST['towID'])) {
    $towID = $_POST['towID'];
}
else{
  $result['isSuccess'] = FALSE;
  $result['message'] = "Type of Work Missing";
  die(json_encode($result));
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
    $result['result'] = $towStmt->fetchColumn();
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