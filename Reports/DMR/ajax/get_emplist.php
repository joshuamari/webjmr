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
$groupSel = NULL;
if (!empty($_POST['groupSel'])) {
    $groupSel = $_POST['groupSel'];
}
$yearMonth = date("Y-m-01");
if (!empty($_POST['monthSel'])) {
    $yearMonth = $_POST['monthSel'];
}
$firstDay = getFirstday($yearMonth);
$lastDay = getLastday($yearMonth, $firstDay);
$dateCompare = " AND fldDate >= '$firstDay' AND fldDate<='$lastDay'";
$selYearMonth = date("Y-m-01", strtotime($yearMonth));
$mgaEmpStmt = "";
$mgaEmpNgBU = "";
$arrVal = [];
$employeeArray = array();
#endregion

#region main
$mainEmpQuery = "SELECT DISTINCT(fldEmployeeNum),fldDateHired FROM emp_prof WHERE fldGroup = :groupSel AND (fldResignDate IS NULL OR fldResignDate > :monthSel) AND fldNick<>''";
$empStmt = $connkdt->prepare($mainEmpQuery);
$empStmt->execute([":groupSel" => $groupSel, ":monthSel" => $selYearMonth]);
if ($empStmt->rowCount() > 0) {
    $empArr = $empStmt->fetchAll();
    foreach ($empArr as $emps) {
        if (date("Y-m-01", strtotime($emps['fldDateHired'])) <= $selYearMonth) {
            $arrVal[] = $emps['fldEmployeeNum'];
        }
    }
    $implodeString = implode("','", $arrVal);
    $mgaEmpNgBU = "('" . $implodeString . "')";
    $mgaEmpStmt = "AND fldEmployeeNum NOT IN";
}

$hiramEmpQ = "SELECT DISTINCT(fldEmployeeNum) FROM dailyreport WHERE (fldProject IN (SELECT fldID FROM projectstable WHERE fldGroup='$groupSel') OR fldTrGroup='$groupSel'  OR (fldProject IN ('$mngProjID','$solProjID') AND fldGroup='$groupSel')) $mgaEmpStmt $mgaEmpNgBU $dateCompare";
$empsStmt = $connwebjmr->prepare($hiramEmpQ);
$empsStmt->execute();
if ($empsStmt->rowCount() > 0) {
    $empsArr = $empsStmt->fetchAll();
    foreach ($empsArr as $emps) {
        $arrVal[] = $emps['fldEmployeeNum'];
    }
    $implodeString = implode("','", $arrVal);
    $mgaEmpNgBU = "('" . $implodeString . "')";
}

if (!empty($arrVal)) {
    $mgaEmpStmt = "AND ep.fldEmployeeNum IN $mgaEmpNgBU";
}

$allEmpQ = "SELECT DISTINCT(ep.fldEmployeeNum),CONCAT(ep.fldSurname,', ',ep.fldFirstname) AS ename FROM emp_prof AS ep LEFT OUTER JOIN departments AS kdtd ON ep.fldEmployeeNum=kdtd.fldManager WHERE ep.fldNick<>'' AND ep.fldEmployeeNum IN $mgaEmpNgBU ORDER BY CASE WHEN ep.fldDesig='SM' THEN 1 WHEN ep.fldDesig='DM' THEN 2 ELSE 3 END,CASE WHEN ep.fldGroup='$groupSel' THEN 1 ELSE ep.fldGroup END,ep.fldEmployeeNum";
$elStmt = $connkdt->prepare($allEmpQ);
$elStmt->execute();
if ($elStmt->rowCount() > 0) {
    $elArr = $elStmt->fetchAll();
    foreach ($elArr as $el) {
        $output = array();
        $enum = $el['fldEmployeeNum'];
        $ename = $el['ename'];
        $output += ["empNum" => $enum];
        $output += ["empName" => $ename];
        array_push($employeeArray, $output);
    }
}

#endregion

#region function

#endregion
echo json_encode($employeeArray);
