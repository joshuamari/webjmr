<?php
#region DB Connect
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$userHash = "";
$empID = 0;
$access = false;
#endregion

#region get data values
if (!empty($_COOKIE["userID"])) {
    $userHash = $_COOKIE["userID"];
}
#endregion

//10 is permission ID
#region main function
try {
    $empidQ = "SELECT fldEmployeeNum as empID FROM kdtlogin WHERE fldUserHash = :userHash";
    $empidStmt = $connkdt->prepare($empidQ);
    $empidStmt->execute([":userHash" => "$userHash"]);
    if ($empidStmt->rowCount() > 0) {

        $empID = $empidStmt->fetchColumn();
    }

    $userQ = "SELECT COUNT(*) FROM user_permissions WHERE permission_id = 10 AND fldEmployeeNum = :empID";
    $userStmt = $connkdt->prepare($userQ);
    $userStmt->execute([":empID" => "$empID"]);
    $userCount = $userStmt->fetchColumn();
    if ($userCount > 0) {
        $access = true;
    }
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($access);
