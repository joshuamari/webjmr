<?php
#region DB Connect
require_once "./global_functions.php";
#endregion

$global_var = [
  'date' => date("Y-m-d"),
  'kia_id' => getkiaProjID(),
  'leaveID' => getLeaveID(),
  'mngID' => getManagementProjects(),
  'noMoreIOW' => $noMoreInputItemOfWorks,
  'oneBUTrainerID' => getOneBUTrainerID(),
  'otherProjID' => getOtherProjID(),
];

echo json_encode($global_var);