<?php
#region DB Connect
require_once '../dbconn/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$empGroup = NULL;
if (!empty($_POST['empGroup'])) {
    $empGroup = $_POST['empGroup'];
}
$ymSelect = date("Y-m");
if (!empty($_POST['ymSelect'])) {
    $ymSelect = $_POST['ymSelect'];
}
$desigList = ["SM", "DM", "AM", "SSS", "SSV", "SV"];
$desigString = "('" . implode("','", $desigList) . "')";
$members = array();
$memberQ = "SELECT ep.fldEmployeeNum,ep.fldFirstname,ep.fldSurname,kp.fldFull FROM emp_prof AS ep JOIN kdtpositions AS kp ON ep.fldDesig=kp.fldAcro WHERE (ep.fldGroup=:empGroup OR (CONCAT('/',ep.fldGroups,'/') LIKE :eGroups)) AND (DATE_FORMAT(ep.fldDateHired, '%Y-%m') <= :ymSel AND (DATE_FORMAT(ep.fldResignDate, '%Y-%m') >= :ymSel OR ep.fldResignDate IS NULL)) AND ep.fldDesig IN $desigString";

#endregion

#region main query
try {
    $memStmt = $connkdt->prepare($memberQ);
    $memStmt->execute([":empGroup" => $empGroup, ":ymSel" => $ymSelect, ":eGroups" => "%/" . $empGroup . "/%"]);

    if ($memStmt->rowCount() > 0) {
        $memarr = $memStmt->fetchAll();
        foreach ($memarr as $mem) {
            $output = array();
            $fname = $mem['fldFirstname'];
            $sname = $mem['fldSurname'];
            $id = (int)$mem['fldEmployeeNum'];
            $desig = $mem['fldFull'];
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

#endregion
echo json_encode($members);
