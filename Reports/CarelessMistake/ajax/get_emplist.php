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
$selYearMonth = date("Y-m-01", strtotime($ymSel));
$eList = array();
#endregion

#region main
$mgaEmpStmt = '';
$mgaEmpNgBU = "";
$empNgBUQ = "SELECT DISTINCT(fldEmployeeNum),fldDateHired FROM emp_prof WHERE fldGroup='$rawGetGroup' AND fldNick<>'' AND (fldResignDate IS NULL OR fldResignDate>('$selYearMonth')) AND fldDesig<>'KDTP'";
$empNgBUStmt = $connkdt->prepare($empNgBUQ);
$empNgBUStmt->execute();
$arrVal = [];
if ($empNgBUStmt->rowCount() > 0) {
    $enbArr = $empNgBUStmt->fetchAll();
    foreach ($enbArr as $enbs) {
        if (date("Y-m-01", strtotime($enbs['fldDateHired'])) <= $selYearMonth) {
            $arrVal[] = $enbs['fldEmployeeNum'];
        }
    }
    $implodeString = implode("','", $arrVal);
    $mgaEmpNgBU = "('" . $implodeString . "')";
    $mgaEmpStmt = "AND fldEmployeeNum NOT IN";
}
$empsQ = "SELECT DISTINCT(fldEmployeeNum) FROM dailyreport WHERE (fldProject IN (SELECT fldID FROM projectstable WHERE fldGroup='$rawGetGroup') OR fldTrGroup='$rawGetGroup'  OR (fldProject IN ('$mngProjID','$solProjID') AND fldGroup='$rawGetGroup')) $mgaEmpStmt $mgaEmpNgBU $dateCompare";
$empsStmt = $connwebjmr->prepare($empsQ);
$empsStmt->execute();
if ($empsStmt->rowCount() > 0) {
    $empsArr = $empsStmt->fetchAll();
    foreach ($empsArr as $emps) {
        $arrVal[] = $emps['fldEmployeeNum'];
    }
    $implodeString = implode("','", $arrVal);
    $mgaEmpNgBU = "('" . $implodeString . "')";
}
if (empty($mgaEmpNgBU)) {
    $mgaEmpNgBU = "('')";
}
//emp#||Name||Group and Desig

$elQ = "SELECT ep.fldEmployeeNum,CONCAT(ep.fldSurname,', ',ep.fldFirstname) AS ename,ep.fldGroup,ep.fldDesig,kdtd.fldDeptCode FROM emp_prof AS ep LEFT OUTER JOIN departments AS kdtd ON ep.fldEmployeeNum=kdtd.fldManager WHERE ep.fldNick<>'' AND ep.fldEmployeeNum IN $mgaEmpNgBU ORDER BY CASE WHEN ep.fldDesig='SM' THEN 1 WHEN ep.fldDesig='DM' THEN 2 ELSE 3 END,CASE WHEN ep.fldGroup='$rawGetGroup' THEN 1 ELSE ep.fldGroup END,ep.fldEmployeeNum";
$elStmt = $connkdt->prepare($elQ);
$elStmt->execute();
if ($elStmt->rowCount() > 0) {
    $elArr = $elStmt->fetchAll();
    foreach ($elArr as $el) {
        $enum = $el['fldEmployeeNum'];
        $ename = $el['ename'];
        $egroup = $el['fldGroup'];
        $edesig = $el['fldDesig'];
        if ($edesig == "DM") {
            $egroup = $el['fldDeptCode'];
        }
        if (!in_array("$enum||$ename||$edesig of $egroup", $eList)) {
            array_push($eList, "$enum||$ename||$edesig of $egroup");
        }
    }
}




#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($eList);
// echo $elQ;
