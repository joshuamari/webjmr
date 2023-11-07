<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';
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
$implodeString = implode("','", array_values($excludeGroups));
$egStmt = " AND fldBU NOT IN ('" . $implodeString . "')";
#endregion

#region main
if (isAllGroups()) {
    $grpQuery = "SELECT fldBU FROM kdtbu WHERE fldDepartment IS NOT NULL $egStmt ORDER BY fldBU";
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
                if (!in_array($grps, $excludeGroups)) {
                    array_push($output, $grps);
                }
            }
        } else {
            $grp = $myGroups['fldGroup'];
            array_push($output, $grp);
        }
    }
}

#endregion

#region function
function isAllGroups()
{
    global $connkdt;
    global $empNum;
    $pID = 24; //CMR all groups MODULE PERMISSION ID kdtphdb>>>>p_permissions
    $accessQ = "SELECT COUNT(*) FROM `user_permissions` WHERE `fldEmployeeNum` = :empNum AND `permission_id` =:pID;";
    $accessStmt = $connkdt->prepare($accessQ);
    $accessStmt->execute([":empNum" => $empNum, ":pID" => $pID]);
    $ac = $accessStmt->fetchColumn();
    if ($ac) {
        return TRUE;
    }
    return FALSE;
}
#endregion

echo json_encode($output);
