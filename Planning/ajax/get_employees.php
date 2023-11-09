<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$projID = NULL;
if (!empty($_POST['projID'])) {
    $projID = $_POST['projID'];
}
$searchEmp = '';
if (!empty($_POST['searchemp'])) {
    $searchEmp = $_POST['searchemp'];
}
$empDeets = array();
$sharedProjects = '';
$groupQ = "SELECT fldGroup FROM projectstable WHERE fldID=:projID";
$groupStmt = $connwebjmr->prepare($groupQ);
$groupStmt->execute([":projID" => $projID]);
$projGroup = $groupStmt->fetchColumn();
$hiramQ = "SELECT * FROM project_share WHERE fldProject=:projID";
$hiramStmt = $connwebjmr->prepare($hiramQ);
$hiramStmt->execute([":projID" => $projID]);
if ($hiramStmt->rowCount() > 0) {
    $hiramArr = $hiramStmt->fetchAll();
    $arrValues = array_column($hiramArr, "fldEmployeeNum");
    $implodeString = implode("','", array_values($arrValues));
    $sharedProjects = "OR fldEmployeeNum IN ('" . $implodeString . "')";
}
$selectedEmps = array();
$exceptList = '';
if (!empty($_POST['selectedEmps'])) {
    $selectedEmps = $_POST['selectedEmps'];
    $implodeString = implode("','", array_values($selectedEmps));
    $exceptList = "AND fldEmployeeNum NOT IN ('" . $implodeString . "')";
}
#endregion

#region main
$empsQ = "SELECT CONCAT(fldSurname,', ',fldFirstName) AS ename,fldEmployeeNum FROM emp_prof WHERE (fldGroup=:projGroup OR fldGroups LIKE :pGroup) AND fldActive=1 AND fldNick<>'' AND fldName LIKE '%$searchEmp%' $exceptList $sharedProjects";
$empsStmt = $connkdt->prepare($empsQ);
$empsStmt->execute([":projGroup" => $projGroup, ":pGroup" => "%$projGroup%"]);
if ($empsStmt->rowCount() > 0) {
    $empArr = $empsStmt->fetchAll();
    foreach ($empArr as $emp) {
        $empname = $emp['ename'];
        $empnum = $emp['fldEmployeeNum'];
        array_push($empDeets, "$empnum||$empname");
    }
}
#endregion

#region function

#endregion
echo json_encode($empDeets);
//$.ajaxSetup({async: false});