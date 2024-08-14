<?php
#region DB Connect
require_once "../../dbconn/dbconnectnew.php";
#endregion

#region Initialize Variable
if(!empty($_POST['grpNum'])){
  $grpNum = $_POST['grpNum'];
}
else{
  $msg['error'] = "No group number provided!";
  $msg['isSuccess'] = false;
  die(json_encode($msg));
}
#endregion

#region main query
try {
  $memberListQ = "SELECT `emplist`.`id`, CONCAT(`emplist`.`surname`, ', ', `emplist`.`firstname`) AS `fullName` FROM `employee_list` AS `emplist`
                  INNER JOIN `employee_group` AS `empgroup` ON `empgroup`.`employee_number` = `emplist`.`id`
                  INNER JOIN `group_list` AS `grList` ON `grList`.`id` = `empgroup`.`group_id`
                  WHERE `grList`.`id` = :grpNum AND (`emp_status` = 1 AND `resignation_date` = '0000-00-00')";
  $memberListStmt = $connnew->prepare($memberListQ);
  $memberListStmt->execute([":grpNum"=>$grpNum]);
  if($memberListStmt->rowCount() > 0) {
    $userGrp = $memberListStmt->fetchAll();
    $msg['result'] = $userGrp;
    $msg['error'] = "User group successfully retrieved!";
    $msg['isSuccess'] = true;
  }
  else{
    $msg['error'] = "No members exists in group number";
    $msg['isSuccess'] = false;
  }

} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($msg);