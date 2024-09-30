<?php
#region DB Connect
require_once '../../../dbconn/dbconnectkdtph.php';
require_once '../../../dbconn/dbconnectnew.php';
require_once '../../../global/globalFunctions.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$result = [
    'isSuccess' => FALSE,
    'message' => 'No access',
];
$login = checkAuthentication();
$mhAccessID = 3;
#endregion

#region get data values

#endregion

#region main function
try {
    if ($login['isSuccess'] == FALSE) {
        $result["message"] = $login['message'];
        die(json_encode($result));
    }
    $ac = getMHReportAccess($login['data']['id']);
    if ($ac) {
        $result['data'] = getGroups($login['data']['id']);
        $result['isSuccess'] = TRUE;
        $result['message'] = "Groups fetched";
    }
} catch (Exception $e) {
    $result['isSuccess'] = FALSE;
    $result['message'] = "Connection failed: " . $e->getMessage();
    die(json_encode($result));
}
#endregion

echo json_encode($result, JSON_PRETTY_PRINT);
