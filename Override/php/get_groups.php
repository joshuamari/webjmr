<?php
#region DB Connect
require_once "../../dbconn/dbconnectnew.php";
#endregion

#region Main Query
try {
  $groupsQ = "SELECT * FROM group_list";
  $groupsStmt = $connnew->prepare($groupsQ);
  $groupsStmt->execute([]);
  if($groupsStmt->rowCount() > 0) {
    $result['result'] = $groupsStmt->fetchAll();
    $result['isSuccess'] = true;
    $result['message'] = "Successfully Retrieved!";
  }
  else{
    $result['isSuccess'] = false;
    $result['message'] = "Failed to retrieve";
  }
} catch (Exception $e) {
  $result["isSuccess"] = false;
  $result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);