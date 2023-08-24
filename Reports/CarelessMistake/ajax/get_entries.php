<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';
require_once '../Includes/globalFunctions.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$getGroups = array();
if (!empty($_POST['getGroup'])) {
    $rawGetGroup = $_POST['getGroup'];
}
$ymSel = NULL;
if (!empty($_REQUEST['getYMSel'])) {
    $ymSel = $_REQUEST['getYMSel'];
}
$cutOff = "1";
if (isset($_REQUEST['getHalfSel'])) {
    $cutOff = $_REQUEST['getHalfSel'];
}
$firstDay = getFirstday($ymSel, $cutOff);
$lastDay = getLastday($ymSel, $cutOff, $firstDay);
$dateCompare = " AND fldDate >= '$firstDay' AND fldDate<'$lastDay'";
$entries = array();
#endregion

#region main
$proj = '';
$projsQ = "SELECT DISTINCT(dr.fldProject) FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID WHERE (dr.fldProject IN (SELECT fldID FROM projectstable WHERE fldGroup='$rawGetGroup')) $dateCompare";
$projStmt = $connwebjmr->prepare($projsQ);
$projStmt->execute();
if ($projStmt->rowCount() > 0) {
    $projsArr = $projStmt->fetchAll();
    $arrValues = array_column($projsArr, "fldProject");
    $implodeString = implode("','", array_values($arrValues));
    $proj = "AND dr.fldProject IN ('" . $implodeString . "')";
}
//emp#||dbIndex||duration
$entQ = "SELECT SUM(fldDuration) AS totalHrs,dr.fldEmployeeNum,pt.fldOrder,dr.fldLocation,dl.fldCode AS locCode,dr.fldProject FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN dispatch_locations AS dl ON dr.fldLocation=dl.fldID WHERE (dr.fldEmployeeNum IS NOT NULL $proj) $dateCompare GROUP BY dr.fldProject,dr.fldEmployeeNum,locCode";
$entStmt = $connwebjmr->prepare($entQ);
$entStmt->execute();
if ($entStmt->rowCount() > 0) {
    $entArr = $entStmt->fetchAll();
    foreach ($entArr as $ent) {
        $enum = $ent['fldEmployeeNum'];
        $thrs = ((float)$ent['totalHrs']) / 60;
        $pOrder = $ent['fldOrder'];
        $projID = $ent['fldProject'];
        $locCode = ($ent['locCode'] == 0) ? 'P' : 'J';
        if (!in_array("$enum||$projID-$locCode||$thrs", $entries)) {
            array_push($entries, "$enum||$projID-$locCode||$thrs");
        }
    }
}
// }
#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($entries);
// echo $entQ;
