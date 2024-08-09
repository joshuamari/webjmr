<?php
#region DB Connect
require_once '../dbconn/dbconnectkdtph.php';
require_once 'globalFunctions.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$result = [
    "isSuccess" => FALSE,
    "message" => "",
    "data" => array()
];
$userID = 0;
$empDetails = array();
#endregion

#region get data values
$userID = getID();
if ($userID === 0) {
    $result["message"] = "Not logged in";
    die(json_encode($result));
}

#endregion


#region main function
try {
} catch (Exception $e) {
}
#endregion

echo json_encode($result);
