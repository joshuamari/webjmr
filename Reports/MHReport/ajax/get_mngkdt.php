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
$rawGetGroup = '';
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
$mngakdt = array();
$projExcept = $defaultProjID;
$projExcept = array_filter($projExcept, function ($value) {
    global $leaveID;
    return $value != $leaveID;
});
$implodeString = implode("','", $projExcept);
$proj = "('" . $implodeString . "')";
#endregion

#region main
//emp#||dbIndex||duration(7,8,9,11,13,22,23,24)//('7','8','9','11','13','22','23','24')ito yung mga5050
$mngkdtQ = "SELECT SUM(fldDuration) AS totalHrs,dr.fldEmployeeNum,pt.fldOrder,dl.fldCode AS locCode,dr.fldProject,dr.fldItem FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN dispatch_locations AS dl ON dr.fldLocation=dl.fldID WHERE (dr.fldProject IN $proj AND (dr.fldGroup='$rawGetGroup' OR dr.fldTrGroup='$rawGetGroup')) $dateCompare GROUP BY locCode,CASE WHEN (dr.fldGroup NOT IN('SYS','ANA','IT','ETCL','MPM') AND fldItem NOT IN('7','8','9','11','13','22','23','24')) THEN dr.fldProject END,dr.fldEmployeeNum ORDER BY dr.fldEmployeeNum";
$mngkdtStmt = $connwebjmr->prepare($mngkdtQ);
$mngkdtStmt->execute();
if ($mngkdtStmt->rowCount() > 0) {
    $mngkdtArr = $mngkdtStmt->fetchAll();
    foreach ($mngkdtArr as $mngkdt) {
        $pID = $mngkdt['fldProject'];
        $itemID = $mngkdt['fldItem'];
        $enum = $mngkdt['fldEmployeeNum'];
        $locCode = ($mngkdt['locCode'] == 0) ? '1' : '2';
        $thrs = ((float)$mngkdt['totalHrs']) / 60;
        $kdtCode = '';
        if ($pID == $mngProjID) {
            if (in_array($rawGetGroup, $noCounterpartBU)) {
                $kdtCode = 'K';
            } else {
                $kdtCode = 'M';
            }
        } else {
            if (in_array($itemID, $kdtWholeItems)) {
                $kdtCode = 'K';
            }
            if (in_array($itemID, $khiWholeItems)) {
                $kdtCode = 'B';
            }
            if (in_array($itemID, $halfItems)) {
                $kdtCode = 'K';
                if (!in_array($rawGetGroup, $noCounterpartBU)) {
                    $thrs = $thrs / 2;
                    array_push($mngakdt, "$enum||$kdtCode$locCode||$thrs");
                    $kdtCode = 'B';
                }
            }
        }
        array_push($mngakdt, "$enum||$kdtCode$locCode||$thrs");
    }
}

#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($mngakdt);
// echo $mngkdtQ;
