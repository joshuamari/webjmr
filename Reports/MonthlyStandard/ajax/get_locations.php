<?php
#region Require Database Connections
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$output = array();
#endregion

#region main

$locationQ = "SELECT * FROM dispatch_locations ORDER BY fldCode,fldID";
$locationStmt = $connwebjmr->query($locationQ);
if ($locationStmt->rowCount() > 0) {
    $locArr = $locationStmt->fetchAll();
    foreach ($locArr as $locs) {
        $locID = $locs['fldID'];
        $locName = $locs['fldLocation'];
        $output[$locID] = $locName;
    }
}
#endregion

#region function

#endregion

echo json_encode($output);
