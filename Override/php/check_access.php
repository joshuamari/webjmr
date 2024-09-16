<?php
#region DB Connect
require_once "../../dbconn/dbconnectkdtph.php";
#endregion

#region Initialize Variable
if(!empty($_POST['empNum'])) {
  $empNum = $_POST['empNum'];
} else {
  $result['isSuccess'] = false;
  $result['message'] = "No Employee ID submitted!";
  die(json_encode($result));
}
$pID = 50; //Override Module Permission ID
#endregion

#region Main Query
try{
  $checkAccessQ = "SELECT * FROM `user_permissions`
                   WHERE `fldEmployeeNum` = :empNum AND `permission_id` =:pID";
  $checkAccessStmt = $connkdt->prepare($checkAccessQ);
  $checkAccessStmt->execute([":empNum" => $empNum, ":pID" => $pID]);
  if($checkAccessStmt->rowCount() > 0) {
    $result['isSuccess'] = true;
    $result['message'] = "Access Granted";
  }
  else{
    $result['isSuccess'] = false;
    $result['message'] = "Access Denied";
  }
} catch (Exception $e) {
  $result["isSuccess"] = false;
  $result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);