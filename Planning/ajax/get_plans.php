<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$getPlanner = NULL;
if (!empty($_POST['getPlanner'])) {
    $getPlanner = $_POST['getPlanner'];
}
$searchStatement = '';
$searchEmpStatement = '';
$searchEmployee = NULL;
if (!empty($_POST['searchEmployee'])) {
    $searchEmployee = $_POST['searchEmployee'];
    $searchEmpStatement = " AND fldName LIKE '%$searchEmployee%'";
}
$searchSDate = NULL;
if (!empty($_POST['searchSDate'])) {
    $searchSDate = $_POST['searchSDate'];
    $searchStatement .= " AND pl.fldStartDate = '$searchSDate'";
}
$filterGroup = NULL;
if (!empty($_POST['filterGroup'])) {
    $filterGroup = $_POST['filterGroup'];
    $searchStatement .= " AND pt.fldGroup = '$filterGroup'";
}
$filterProject = NULL;
if (!empty($_POST['filterProject'])) {
    $filterProject = $_POST['filterProject'];
    $searchStatement .= " AND pt.fldProject = '$filterProject'";
}
$filterItem = NULL;
if (!empty($_POST['filterItem'])) {
    $filterItem = $_POST['filterItem'];
    $searchStatement .= " AND it.fldItem = '$filterItem'";
}
$filterJRD = NULL;
if (!empty($_POST['filterJRD'])) {
    $filterJRD = $_POST['filterJRD'];
    $searchStatement .= " AND dr.fldJob = '$filterJRD'";
}
$filterStatus = NULL;
if (!empty($_POST['filterStatus'])) {
    $filterStatus = $_POST['filterStatus'];

    switch ($filterStatus) {
        case "1":
            $statStmt = "IS NULL";
            break;
        case "2":
            $statStmt = "IS NOT NULL";
            break;
    }
    $searchStatement .= " AND pl.fldStatus $statStmt";
}
$planned = array();
#endregion

#region main
$plansQ = "SELECT pl.*,dr.fldID AS jobID,dr.fldJob AS projJob,pt.fldProject AS projName,it.fldItem AS projItem,pt.fldGroup AS projGroup FROM planning AS pl JOIN drawingreference AS dr ON pl.fldJob=dr.fldID JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN itemofworkstable AS it ON dr.fldItem=it.fldID WHERE pl.fldPlanner=:getPlanner $searchStatement ORDER BY pl.fldStartDate DESC";
$plansStmt = $connwebjmr->prepare($plansQ);
$plansStmt->execute([":getPlanner" => $getPlanner]);
if ($plansStmt->rowCount() > 0) {
    $planArr = $plansStmt->fetchAll();
    foreach ($planArr as $plan) {
        $output = array();
        $planID = $plan['fldID'];
        $projGroup = $plan['projGroup'];
        $projName = $plan['projName'];
        $projItem = $plan['projItem'];
        $projJob = $plan['projJob'];
        $projJobID = $plan['jobID'];
        $plannerID = $plan['fldPlanner'];
        $projEmp = $plan['fldEmployeeNum'];
        $projEmpName = getEmpName($projEmp);
        if (is_null($projEmpName)) {
            continue;
        }
        $rawProjStart = strtotime($plan['fldStartDate']);
        $rawProjEnd = strtotime($plan['fldEndDate']);
        $projStart = date("M d, Y", $rawProjStart);
        $projEnd = date("M d, Y", $rawProjEnd);
        $projDays = ceil(($rawProjEnd - $rawProjStart) / (60 * 60 * 24)) + 1;
        $projMH = (($plan['fldHours']) * $projDays) / 60;
        $usedHours = getUsedHours($projJobID, $projEmp, $plan['fldStartDate'], $plan['fldEndDate']);
        $projStatus = $plan['fldStatus'];
        if ($projStatus != NULL) {
            $projStatus = date("M d, Y", strtotime($projStatus));
        }
        $output += ["planID" => $planID];
        $output += ["plannerID" => $plannerID];
        $output += ["projGroup" => $projGroup];
        $output += ["projName" => $projName];
        $output += ["projItem" => $projItem];
        $output += ["projJob" => $projJob];
        $output += ["projEmpName" => $projEmpName];
        $output += ["projStart" => $projStart];
        $output += ["projEnd" => $projEnd];
        $output += ["projMH" => $projMH];
        $output += ["usedHours" => $usedHours];
        $output += ["projStatus" => $projStatus];
        array_push($planned, $output);
        // array_push($planned, "$planID||$projGroup||$projName||$projItem||$projJob||$projEmpName||$projStart||$projEnd||$projMH||$usedHours||$projStatus");
    }
}
#endregion

#region function
function getEmpName($employeeNumber)
{
    global $connkdt;
    global $searchEmpStatement;
    $ename = NULL;
    $nameQ = "SELECT CONCAT(fldSurname,', ',fldFirstname) AS ename FROM emp_prof WHERE fldEmployeeNum=:employeeNumber $searchEmpStatement";
    $nameStmt = $connkdt->prepare($nameQ);
    $nameStmt->execute([":employeeNumber" => $employeeNumber]);
    if ($nameStmt->rowCount() > 0) {
        $ename = $nameStmt->fetchColumn();
    }
    return $ename;
}
function getUsedHours($jobID, $employeeNumber, $dateStart, $dateEnd)
{
    global $connwebjmr;
    $projHours = 0;
    $hoursQ = "SELECT SUM(fldDuration) FROM dailyreport WHERE fldEmployeeNum=:employeeNumber AND fldJobRequestDescription=:jobID AND fldDate BETWEEN :dateStart AND :dateEnd";
    $hoursStmt = $connwebjmr->prepare($hoursQ);
    $hoursStmt->execute([":employeeNumber" => $employeeNumber, ":jobID" => $jobID, ":dateStart" => $dateStart, ":dateEnd" => $dateEnd]);
    $rawHours = $hoursStmt->fetchColumn();
    $projHours = $rawHours / 60;
    return $projHours;
}
#endregion
echo json_encode($planned);
