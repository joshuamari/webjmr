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
$hiramEntries = array();
$projExcept = $defaultProjID;
$proj = "";
$projsQ = "SELECT DISTINCT(dr.fldProject) FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID WHERE (dr.fldProject IN (SELECT fldID FROM projectstable WHERE fldGroup='$rawGetGroup') OR fldTrGroup='$rawGetGroup') $dateCompare";
$projStmt = $connwebjmr->prepare($projsQ);
$projStmt->execute();
if ($projStmt->rowCount() > 0) {
    $projsArr = $projStmt->fetchAll();
    foreach ($projsArr as $projs) {
        $projID = $projs['fldProject'];
        $projExcept[] = $projID;
    }
}

$implodeString = implode("','", $projExcept);
$proj = " AND dr.fldProject NOT IN ('" . $implodeString . "')";


#endregion

#region main
$mgaEmpStmt = '';
$mgaEmpNgBU = "";
$arrValue = [];
$empNgBUQ = "SELECT DISTINCT(fldEmployeeNum) FROM emp_prof WHERE fldGroup='$rawGetGroup' AND fldNick<>'' AND fldActive=1 AND fldDesig<>'DM'";
$empNgBUStmt = $connkdt->prepare($empNgBUQ);
$empNgBUStmt->execute();
if ($empNgBUStmt->rowCount() > 0) {
    $enbArr = $empNgBUStmt->fetchAll();
    foreach ($enbArr as $enbs) {
        $arrValue[] = $enbs['fldEmployeeNum'];
    }
    $implodeString = implode("','", $arrValue);
    $mgaEmpNgBU = "('" . $implodeString . "')";
    $mgaEmpStmt = "AND fldEmployeeNum NOT IN";
}
$empsQ = "SELECT DISTINCT(fldEmployeeNum) FROM dailyreport WHERE (fldProject='$mngProjID' AND fldGroup='$rawGetGroup') $mgaEmpStmt $mgaEmpNgBU $dateCompare";
$empsStmt = $connwebjmr->prepare($empsQ);
$empsStmt->execute();
if ($empsStmt->rowCount() > 0) {
    $empsArr = $empsStmt->fetchAll();
    foreach ($empsArr as $emps) {
        // $mgaEmpNgBU.="'".$emps['fldEmployeeNum']."',";
        $arrValue[] = $emps['fldEmployeeNum'];
    }
    $implodeString = implode("','", $arrValue);
    $mgaEmpNgBU = "('" . $implodeString . "')";
}
if (empty($mgaEmpNgBU)) {
    $mgaEmpNgBU = "('')";
}
//emp#||dbIndex||duration
$hiramEntQ = "SELECT SUM(fldDuration) AS totalHrs,dr.fldEmployeeNum,pt.fldOrder,dl.fldCode AS locCode,dr.fldProject FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN dispatch_locations AS dl ON dr.fldLocation=dl.fldID WHERE ((dr.fldGroup='$rawGetGroup' AND dr.fldTrGroup IS NOT NULL) OR dr.fldEmployeeNum IS NOT NULL $proj AND fldEmployeeNum IN $mgaEmpNgBU) $dateCompare  GROUP BY dr.fldProject,dr.fldEmployeeNum,locCode";
$hiramEntStmt = $connwebjmr->prepare($hiramEntQ);
$hiramEntStmt->execute();
if ($hiramEntStmt->rowCount() > 0) {
    $hiramEntArr = $hiramEntStmt->fetchAll();
    foreach ($hiramEntArr as $hiramEnt) {
        $pOrder = $hiramEnt['fldOrder'];
        $projID = $hiramEnt['fldProject'];
        $enum = $hiramEnt['fldEmployeeNum'];
        $locCode = ($hiramEnt['locCode'] == 0) ? 'P' : 'J';
        $thrs = ((float)$hiramEnt['totalHrs']) / 60;
        array_push($hiramEntries, "$enum||$projID-$locCode||$thrs");
    }
}


#endregion

#region function

#endregion
echo json_encode($hiramEntries);
