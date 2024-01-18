<?php
#region DB Connect
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$locations = array();
#endregion

try {
    $locQ = "SELECT fldID as id, fldLocation as locName FROM `dispatch_locations`";
    $locStmt = $connwebjmr->prepare($locQ);
    $locStmt->execute();
    $locations = $locStmt->fetchAll();
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}

echo json_encode($locations);
