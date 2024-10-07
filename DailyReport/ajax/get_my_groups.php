<?php
#region DB Connect
require_once "../../dbconn/dbconnectnew.php";
#endregion

#region Initialize Variable
if(!empty($_POST['empNum'])){
  $empNum = $_POST['empNum'];
}
else{
  $result['isSuccess'] = FALSE;
  $result['message'] = "No employee number provided!";
  die(json_encode($result));
}
#endregion

#region main query
try {
  $userGroupQ = "SELECT `grList`.`id`, `grList`.`abbreviation` FROM `employee_list` AS `emplist`
                INNER JOIN `employee_group` AS `empgroup` ON `empgroup`.`employee_number` = `emplist`.`id`
                INNER JOIN `group_list` AS `grList` ON `grList`.`id` = `empgroup`.`group_id`
                WHERE `emplist`.`id` = :empNum";
  $userGroupStmt = $connnew->prepare($userGroupQ);
  $userGroupStmt->execute([":empNum"=>$empNum]);
  if($userGroupStmt->rowCount() > 0){
    $result['result'] = $userGroupStmt->fetchAll();
    $result['message'] = "User group successfully retrieved!";
    $result['isSuccess'] = true;
  }
  else{
    $result['message'] = "No group exists in employee number";
    $result['isSuccess'] = false;
  }
} catch (Exception $e) {
  $result["isSuccess"] = FALSE;
	$result['message'] =  "Connection failed: " . $e->getMessage();;
}
#endregion

echo json_encode($result);