<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$empSelect = NULL;
if (!empty($_POST['empSelect'])) {
    $empSelect = $_POST['empSelect'];
}
$ymSelect = date("Y-m");
if (!empty($_POST['ymSelect'])) {
    $ymSelect  = $_POST['ymSelect'];
}
$locSelect = 1;
if (!empty($_POST['locSelect'])) {
    $locSelect = $_POST['locSelect'];
}
$columnMap = [
    'proj' => 'fldProject',
    'item' => 'fldItem',
    'job' => 'fldJob',
    'tow' => 'fldTow',
    'rem' => 'fldRemarks',
    'dur' => 'fldDuration',
];
$columnsRaw = [];
if (!empty($_POST['selColumns'])) {
    $columnsRaw = $_POST['selColumns'];
}
$selectedColumns = [];
foreach ($columnsRaw as $col) {
    $selectedColumns[] = $columnMap[$col];
}
$columnsStmt = implode(', ', $selectedColumns);
$exclude = FALSE;
if (!empty($_POST['exclude'])) {
    $exclude = $_POST['exclude'];
}
$reportData = array();
#endregion

#region main
$reportQ = "SELECT dr.fldDate, dr.fldDuration, pt.fldOrder, pt.fldProject,it.fldItem,jrd.fldJob FROM `dailyreport` AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN itemofworkstable AS it ON dr.fldItem=it.fldID JOIN drawingreference AS jrd ON dr.fldJobRequestDescription=jrd.fldID WHERE dr.fldEmployeeNum=:empSelect AND dr.fldDate LIKE :ymSelect ORDER BY dr.fldDate";
#endregion

#region function
function getName($empNum)
{
    global $connkdt;
    $eName = '';
    $nameQ = "SELECT CONCAT(fldSurname,', ',fldFirstname) AS ename FROM emp_prof WHERE fldEmployeeNum = :empNum";
    $nameStmt = $connkdt->prepare($nameQ);
    $nameStmt->execute([":empNum" => $empNum]);
    $eName = $nameStmt->fetchColumn();
    return $eName;
}
#endregion
echo json_encode($entriesArray, JSON_PRETTY_PRINT);
