<?php
#region DB Connect
require_once '../dbconn/dbconnectkdtph.php';
require_once '../dbconn/dbconnectnew.php';
require_once 'globalFunctions.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable

#endregion

#region get data values

#endregion

#region main function
$result = checkAuthentication();
#endregion

echo json_encode($result);
