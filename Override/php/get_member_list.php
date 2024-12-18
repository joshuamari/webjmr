<?php
#region DB Connect
require_once "../../dbconn/dbconnectnew.php";
#endregion

#region Initialize Variable
if(!empty($_POST['grpNum'])){
  $grpNum = $_POST['grpNum'];
}
else{
  $result['message'] = "No group number provided!";
  $result['isSuccess'] = FALSE;
  die(json_encode($result));
}
#endregion

#region main query
try {
  $memberListQ = "SELECT `emplist`.`id`, CONCAT(`emplist`.`surname`, ', ', `emplist`.`firstname`) AS `fullName` FROM `employee_list` AS `emplist`
                  WHERE `emplist`.`group_id` = :grpNum AND (`emp_status` = 1 AND (`resignation_date` = '0000-00-00' OR `resignation_date` IS NULL))";
  $memberListStmt = $connnew->prepare($memberListQ);
  $memberListStmt->execute([":grpNum"=>$grpNum]);
  if($memberListStmt->rowCount() > 0) {
    $result['result'] = $memberListStmt->fetchAll();
    $result['isSuccess'] = TRUE;
    $result['message'] = "User group successfully retrieved!";
  }
  else{
    $msg['isSuccess'] = FALSE;
    $msg['message'] = "No members exists in group number";
  }
} catch (Exception $e) {
  $result["isSuccess"] = FALSE;
	$result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);