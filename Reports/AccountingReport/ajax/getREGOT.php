<?php
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';

$output = array();
$group = NULL;
$month = date("Y-m");
if (!empty($_POST['group'])) {
    $group = $_POST['group'];
}
if (!empty($_POST['yearmonth'])) {
    $month = $_POST['yearmonth'];
}
$membersStmt = '';
$mems = array();
$memQ = "SELECT fldEmployeeNum FROM emp_prof WHERE fldGroup = :grp AND fldNick<>''";
$memStmt = $connkdt->prepare($memQ);
$memStmt->execute([":grp" => $group]);
if ($memStmt->rowCount() > 0) {
    $memArr = $memStmt->fetchAll();
}

$employeeNums = array_column($memArr, 'fldEmployeeNum');
$employeeNums = array_filter($employeeNums);
// echo json_encode($employeeNums);
$membersStmt = ' AND fldEmployeeNum IN (' . implode(',', $employeeNums) . ')';

$totalReg = 0;
$regQ = "SELECT SUM(fldDuration)/60 FROM dailyreport WHERE fldDate LIKE :yearmonth AND fldMHType=0 AND fldLocation IN (1,2) $membersStmt";
$regStmt = $connwebjmr->prepare($regQ);
$regStmt->execute([":yearmonth" => "$month%"]);
$total = $regStmt->fetchColumn();

$output["totalRegular"] = $total;

$totalOT = 0;
$otQ = "SELECT SUM(fldDuration)/60 FROM dailyreport WHERE fldDate LIKE :yearmonth AND fldMHType=1 AND fldLocation IN (1,2) $membersStmt";
$otStmt = $connwebjmr->prepare($otQ);
$otStmt->execute([":yearmonth" => "$month%"]);
$totalOT = $otStmt->fetchColumn();

$output["totalOvertime"] = $totalOT;

echo json_encode($output);
