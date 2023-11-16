<?php
#region DB Connect
require_once '../dbconn/dbconnectkdtph.php';
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


#endregion

#region main query
try {
    if (isAllGroups($empNum)) {
        $groupQ = "SELECT fldID,fldBU FROM kdtbu WHERE fldDepartment IS NOT NULL AND fldDepartment<>'' ORDER BY fldBU";
        $groupStmt = $connkdt->query($groupQ);
    } else {
        $groupQ = "SELECT DISTINCT g.fldID,g.fldBU
        FROM kdtbu g
        JOIN emp_prof e ON 
    (CONCAT('/', e.fldGroups, '/') LIKE CONCAT('%/', g.fldBU, '/%') AND e.fldGroups <> '')
    OR 
    e.fldGroup = g.fldBU
        WHERE e.fldEmployeeNum = :empNum ORDER BY fldBU";

        $groupStmt = $connkdt->prepare($groupQ);
        $groupStmt->execute([":empNum" => $empNum]);
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
    echo "Connection failed: " . $e->getMessage();
}

#endregion
#region FUNCTIONS
function isAllGroups($empNum)
{
    global $connkdt;
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
echo json_encode($groups);
