<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "../../Override/php/global.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$required_fields = [
  'empNum' => "Employee No.",
  'grpNum' => "Group No.",
  'selDate' => "Selected Date",
  'locID' => "Location",
  'projID' => "Project ID",
  'itemID' => "Item ID",
];

$input = $_POST;
$missing_fields = [];
#endregion
#initialize Session
session_start();

#region input checking region
foreach ($required_fields as $key => $descrpition) {
  if (empty($input[$key])) {
    $missing_fields[] = $descrpition;
  }
}
#endregion

#region for separtion of error
$count = count($missing_fields);
if ($count > 0) {
  if ($count === 1) {
    $result['message'] = "{$missing_fields[0]} is missing.";
  } elseif ($count === 2) {
    $result['message'] = "{$missing_fields[0]} and {$missing_fields[1]} are missing.";
  } else {
    $last_field = array_pop($missing_fields);
    $result['message'] = implode(', ', $missing_fields) . ", and $last_field are missing.";
  }
  die(json_encode($result));
}
#endregion

#region ADDITIONAL CONDITION
// $addType = (!empty($_POST['addType'])) ? $_POST['addType'] : 0;
$jobReqDesc = (!empty($_POST['jobReqDesc'])) ? $_POST['jobReqDesc'] : null;




#endregion

echo json_encode($result);