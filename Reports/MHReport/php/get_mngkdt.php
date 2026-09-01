<?php
#region Require Database Connections
require_once '../../../dbconn/dbconnectkdtph.php';
require_once '../../../dbconn/dbconnectnew.php';
require_once '../../../dbconn/dbconnectwebjmr.php';
require_once '../../../global/globalFunctions.php';
require_once __DIR__ . '/mh_billing.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$group = "";
if (!empty($_POST['getGroup'])) {
    $group = $_POST['getGroup'];
}

$ymSel = date("Y-m");
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
$hoursByCell = array();
$billing = mhBillingContext($connwebjmr, $connkdt);
$mngProjID = $billing['mngProjID'];
$noCounterpartBU = $billing['noCounterpartBU'];
$kdtShareByItemId = $billing['kdtShareByItemId'];
$noCounterpart = in_array($group, $noCounterpartBU);
$defaultProjectIds = $billing['defaultProjectIds'];
#endregion

#region main
if (!empty($defaultProjectIds)) {
    $implodeString = implode("','", $defaultProjectIds);
    $proj = "('" . $implodeString . "')";
    // emp#||dbIndex||duration — grouped by item so mixed KDT shares stay separate
    $mngkdtQ = "SELECT SUM(fldDuration) AS totalHrs,dr.fldEmployeeNum,pt.fldOrder,dl.fldCode AS locCode,dr.fldProject,dr.fldItem FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN dispatch_locations AS dl ON dr.fldLocation=dl.fldID WHERE (dr.fldProject IN $proj AND (dr.fldGroup='$group' OR dr.fldTrGroup='$group')) $dateCompare GROUP BY dr.fldEmployeeNum,dr.fldItem,locCode,dr.fldProject ORDER BY dr.fldEmployeeNum";
    $mngkdtStmt = $connwebjmr->prepare($mngkdtQ);
    $mngkdtStmt->execute();
    if ($mngkdtStmt->rowCount() > 0) {
        $mngkdtArr = $mngkdtStmt->fetchAll();
        foreach ($mngkdtArr as $mngkdt) {
            $pID = $mngkdt['fldProject'];
            $itemID = (string) $mngkdt['fldItem'];
            $enum = $mngkdt['fldEmployeeNum'];
            $locCode = ($mngkdt['locCode'] == 0) ? '1' : '2';
            $thrs = ((float) $mngkdt['totalHrs']) / 60;

            if ((int) $pID === (int) $mngProjID) {
                $kdtCode = $noCounterpart ? 'K' : 'M';
                $cellKey = $enum . '||' . $kdtCode . $locCode;
                $hoursByCell[$cellKey] = ($hoursByCell[$cellKey] ?? 0) + $thrs;
                continue;
            }

            $kdtShare = mhItemKdtShare($itemID, $kdtShareByItemId);
            if ($kdtShare === null) {
                continue;
            }

            foreach (mhSplitHoursByShare($thrs, $kdtShare, $noCounterpart) as $bucket => $hours) {
                $cellKey = $enum . '||' . $bucket . $locCode;
                $hoursByCell[$cellKey] = ($hoursByCell[$cellKey] ?? 0) + $hours;
            }
        }
    }
}

foreach ($hoursByCell as $cellKey => $hours) {
    $mngakdt[] = $cellKey . '||' . $hours;
}

#endregion

echo json_encode($mngakdt);
