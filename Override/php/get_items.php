<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "./global.php";
#endregion

#region Initialize Variable
if(!empty($_POST['empNum'])) {
  $empID = $_POST['empNum'];
}
else {
  $msg['isSuccess'] = FALSE;
  $msg['error'][] = "Employee No.";
}
if(!empty($_POST['projID'])){
  $projID = $_POST['projID'];
}
else{
  $msg['isSuccess'] = FALSE;
  $msg['error'][] = "Project ID";
}
if(!empty($_POST['grpNum'])){
  $grpNum = $_POST['grpNum'];
}
else{
  $msg['isSuccess'] = FALSE;
  $msg['error'][] = "Group";
}

#regionend