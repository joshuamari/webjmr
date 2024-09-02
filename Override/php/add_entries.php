<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion

#region Initialize Variable
if(!empty($_POST['grpNum'])){
  $grpNum = $_POST['grpNum'];
}
else{
  $msg['isSuccess'] = FALSE;
  $msg['error'][] = "Group";
}
if(!empty($_POST['empNum'])) {
  $empID = $_POST['empNum'];
}
else {
  $msg['isSuccess'] = FALSE;
  $msg['error'][] = "Employee No.";
}
if(!empty($_POST['setDate'])) {
  $setDate = $_POST['setDate'];
}
else {
  $msg['isSuccess'] = FALSE;
  $msg['error'][] = "Date";
}
if(!empty($_POST['location'])) {
  $location = $_POST['location'];
}
else {
  $msg['isSuccess'] = FALSE;
  $msg['error'][] = "Location";
}
if(!empty($_POST['projID'])){
  $projID = $_POST['projID'];
}
else{
  $msg['isSuccess'] = FALSE;
  $msg['error'][] = "Project ID";
}

$itemID = !empty($_POST['itemID']) ? $_POST['itemID'] : "";
$addType = (!empty($_POST['addType'])) ? $_POST['addType'] : 0;
#endregion

#region ADDITIONAL CONDITION
$grpAbbr = getGroup($grpNum);
#endregion

echo $addType;