<?php
#region DB Connect
require_once '../dbconn/dbconnectkdtph.php';
require_once '../dbconn/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable

$empNum = NULL;
if (!empty($_POST['empnum'])) {
    $empNum = $_POST['empnum'];
}
$groups = array();
$myGroups = array();
$mainGroupStmt = "";
$myGroupStmt = "";
#endregion

#region main query
try {
    if (seeAllGroups($empNum)) {
        $groupQ = "SELECT fldID,fldBU FROM kdtbu WHERE fldDepartment IS NOT NULL AND fldDepartment<>'' ORDER BY fldBU";
        $groupStmt = $connkdt->query($groupQ);
    } else {
        $mainGroupQ = "SELECT DISTINCT g.fldID,g.fldBU
            FROM kdtbu g
            JOIN emp_prof e ON 
        (CONCAT('/', e.fldGroups, '/') LIKE CONCAT('%/', g.fldBU, '/%') AND e.fldGroups <> '')
        OR 
        e.fldGroup = g.fldBU
            WHERE e.fldEmployeeNum = :empNum ORDER BY fldBU";

        $mainGroupStmt = $connkdt->prepare($mainGroupQ);
        $mainGroupStmt->execute([":empNum" => $empNum]);
        if ($mainGroupStmt->rowCount() > 0) {
            $myGroupArr = $mainGroupStmt->fetchAll();
            foreach ($myGroupArr as $mg) {
                array_push($myGroups, $mg['fldBU']);
            }
            $mainGroupStmt = " AND pt.fldGroup NOT IN ('" . implode("','", $myGroups) . "')";
        }
        $drGroupQ = "SELECT DISTINCT(pt.fldGroup) FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID WHERE dr.fldEmployeeNum=:empNum $mainGroupStmt";
        $drGroupStmt = $connwebjmr->prepare($drGroupQ);
        $drGroupStmt->execute([":empNum" => $empNum]);

        if ($drGroupStmt->rowCount() > 0) {
            $drGroupArr = $drGroupStmt->fetchAll();
            foreach ($drGroupArr as $dg) {
                array_push($myGroups, $dg['fldGroup']);
            }
        }
        $myGroupStmt = " AND fldBU IN ('" . implode("','", $myGroups) . "')";
        $groupQ = "SELECT fldID,fldBU FROM kdtbu WHERE fldDepartment IS NOT NULL AND fldDepartment<>'' $myGroupStmt ORDER BY fldBU";
        $groupStmt = $connkdt->prepare($groupQ);
        $groupStmt->execute();
    }

    if ($groupStmt->rowCount() > 0) {
        $grouparr = $groupStmt->fetchAll();
        foreach ($grouparr as $grp) {
            $output = array();
            $name = $grp['fldBU'];
            $id = $grp['fldID'];
            $output += ["name" => $name];
            $output += ["id" => $id];
            array_push($groups, $output);
        }
    }
} catch (Exception $e) {
    echo "Connections failed: " . $e->getMessage();
}

#endregion
#region FUNCTIONS
function seeAllGroups($empNum)
{
    global $connkdt;
    $pID = 35; //Individual see all groups MODULE PERMISSION ID kdtphdb>>>>p_permissions
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
echo json_encode($groups);
