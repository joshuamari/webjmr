<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$output = array();
$empNum = '';
if (isset($_REQUEST['empNum'])) {
    $empNum = $_REQUEST['empNum'];
}
#endregion

#region main
if (in_array($empNum, $reportAllGroupAccess)) {
    $grpQuery = "SELECT fldBU FROM kdtbu WHERE fldDepartment IS NOT NULL AND fldBU NOT IN ('DXT','INT','TEG') ORDER BY fldBU";
    $grpStmt = $connkdt->query($grpQuery);
    if ($grpStmt->rowCount() > 0) {
        $grpArr = $grpStmt->fetchAll();
        foreach ($grpArr as $grps) {
            $grp = $grps['fldBU'];
            array_push($output, $grp);
        }
    }
} else {
    $myGroupQ = "SELECT * FROM emp_prof WHERE fldEmployeeNum='$empNum'";
    $myGroupStmt = $connkdt->query($myGroupQ);
    $myGroupArr = $myGroupStmt->fetchAll();
    foreach ($myGroupArr as $myGroups) {
        if ($myGroups['fldGroups'] != '') {
            $groupsArr = explode("/", $myGroups['fldGroups']);
            foreach ($groupsArr as $grps) {
                array_push($output, $grps);
            }
        } else {
            $grp = $myGroups['fldGroup'];
            array_push($output, $grp);
        }
    }
}

#endregion

#region function

#endregion

echo json_encode($output);
