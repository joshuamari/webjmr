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
$empGroup = NULL;
if (!empty($_POST['empGroup'])) {
    $empGroup = $_POST['empGroup'];
}
$ymSelect = date("Y-m");
if (!empty($_POST['ymSelect'])) {
    $ymSelect = $_POST['ymSelect'];
}
$members = array();


#endregion

#region main query
try {
    if (seeOtherMembers($empNum)) {
        $memberQ = "SELECT fldEmployeeNum,fldFirstname,fldSurname,fldDesig FROM emp_prof WHERE fldGroup=:empGroup AND (DATE_FORMAT(fldDateHired, '%Y-%m') <= :ymSel AND (DATE_FORMAT(fldResignDate, '%Y-%m') >= :ymSel OR fldResignDate IS NULL)) ORDER BY fldEmployeeNum";
        $memStmt = $connkdt->prepare($memberQ);
        $memStmt->execute([":empGroup" => $empGroup, ":ymSel" => $ymSelect]);
    } else {
        $memberQ = "SELECT fldEmployeeNum,fldFirstname,fldSurname,fldDesig FROM emp_prof WHERE fldEmployeeNum=:empNum";
        $memStmt = $connkdt->prepare($memberQ);
        $memStmt->execute([":empNum" => $empNum]);
    }


    if ($memStmt->rowCount() > 0) {
        $memarr = $memStmt->fetchAll();
        foreach ($memarr as $mem) {
            $output = array();
            $fname = $mem['fldFirstname'];
            $sname = $mem['fldSurname'];
            $id = (int)$mem['fldEmployeeNum'];
            $desig = $mem['fldDesig'];
            $output += ["fname" => $fname];
            $output += ["sname" => $sname];
            $output += ["id" => $id];
            $output += ["desig" => $desig];
            array_push($members, $output);
        }
    }
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}

#endregion
#region FUNCTIONS
function seeOtherMembers($empNum)
{
    global $connkdt;
    $pID = 34; //Individual see other members MODULE PERMISSION ID kdtphdb>>>>p_permissions
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
echo json_encode($members);
