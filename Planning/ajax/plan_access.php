<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$empNum = NULL;
if (!empty($_POST['empNum'])) {
    $empNum = $_POST['empNum'];
}
$pID = 5; //PLANNING UI MODULE PERMISSION ID kdtphdb>>>>p_permissions
$access = FALSE;
#endregion

#region main query
#region lumang access control
// $accessQ="SELECT fldJMCImport FROM kdtoptions WHERE fldEmployeeNumber='$empNum'";
// $accessStmt=$connkdt->query($accessQ);
// $access=$accessStmt->fetchColumn();
#endregion
$accessQ = "SELECT COUNT(*) FROM `user_permissions` WHERE `fldEmployeeNum` = :empNum AND `permission_id` =:pID;";
$accessStmt = $connkdt->prepare($accessQ);
$accessStmt->execute([":empNum" => $empNum, ":pID" => $pID]);
$ac = $accessStmt->fetchColumn();
if ($ac) {
    $access = TRUE;
}
#endregion

#region function

#endregion

echo json_encode($access);
