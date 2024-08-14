<?php
#region DB Connect
require_once "../../dbconn/dbconnectnew.php";
#endregion

#region Initialize Variable
if(!empty($_POST['empNum'])){
  $empNum = $_POST['empNum'];
}
else{
  $msg['error'] = "No employee number provided!";
  $msg['isSuccess'] = false;
  die(json_encode($msg));
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
    $userGrp = $userGroupStmt->fetchAll();
    $msg['result'] = $userGrp;
    $msg['error'] = "User group successfully retrieved!";
    $msg['isSuccess'] = true;
  }
  else{
    $msg['error'] = "No group exists in employee number";
    $msg['isSuccess'] = false;
  }
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($msg);