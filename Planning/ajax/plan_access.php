<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$empNum = null;
if (!empty($_POST['empNum'])) {
    $empNum = $_POST['empNum'];
}

$planningPID = 5;   // Planning UI module permission
$drApprovalsPID = 53; // DR Approvals permission

$response = [
    "hasPlanning" => false,
    "hasDRApprovals" => false,
];
#endregion

#region main query
$accessQ = "
    SELECT permission_id
    FROM user_permissions
    WHERE fldEmployeeNum = :empNum
      AND permission_id IN (:planningPID, :drApprovalsPID)
";
$accessStmt = $connkdt->prepare($accessQ);
$accessStmt->execute([
    ":empNum" => $empNum,
    ":planningPID" => $planningPID,
    ":drApprovalsPID" => $drApprovalsPID,
]);

$permissions = $accessStmt->fetchAll(PDO::FETCH_COLUMN);

if (in_array($planningPID, $permissions)) {
    $response["hasPlanning"] = true;
}

if (in_array($drApprovalsPID, $permissions)) {
    $response["hasDRApprovals"] = true;
}
#endregion

echo json_encode($response);