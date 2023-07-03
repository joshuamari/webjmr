<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$output = array();
#endregion

#region main
$grpQuery = "SELECT fldBU FROM kdtbu WHERE fldDepartment IS NOT NULL ORDER BY fldBU";
$grpStmt = $connkdt -> query($grpQuery);
if($grpStmt->rowCount()>0){
    $grpArr = $grpStmt->fetchAll();
    foreach($grpArr AS $grps){
        $grp = $grps['fldBU'];
        array_push($output,$grp);
    }
}

#endregion

#region function

#endregion

echo json_encode($output);