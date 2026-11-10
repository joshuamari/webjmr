<?php
die();
#region DB Connect
require_once '../dbconn/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$individualAccess = 34;
$individualQ = "INSERT INTO `user_permissions`(permission_id,fldEmployeeNum) VALUES (:pID,:empID)";
$individualStmt = $connkdt->prepare($individualQ);
#endregion

#region main query
try {
    $jmcQ = "SELECT ep.fldEmployeeNum FROM `user_permissions` AS up JOIN emp_prof AS ep ON up.fldEmployeeNum=ep.fldEmployeeNum WHERE up.permission_id=:pID AND ep.fldActive = 1 AND ep.fldEmployeeNum NOT IN (474,483);";
    $jmcStmt = $connkdt->prepare($jmcQ);
    $jmcStmt->execute([":pID" => 1]);
    $jmcArr = $jmcStmt->fetchAll();
    foreach ($jmcArr as $emp) {
        $empID = $emp['fldEmployeeNum'];
        $individualStmt->execute([":pID" => $individualAccess, ":empID" => $empID]);
    }
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}

#endregion
#region FUNCTIONS

#endregion
