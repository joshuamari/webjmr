<?php
#region Require Database Connections
require_once '../Includes/dbconnectwebjmr.php';
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$planID = NULL;
if (!empty($_POST['planID'])) {
    $planID = $_POST['planID'];
}
$empNum = NULL;
if (!empty($_POST['empID'])) {
    $empNum = $_POST['empID'];
}
$planDetails = array();
#endregion

#region main
$plansQ = "SELECT pl.*,dr.fldID AS projJobID,dr.fldJob AS projJob,pt.fldProject AS projName,it.fldItem AS projItem FROM planning AS pl JOIN drawingreference AS dr ON pl.fldJob=dr.fldID JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN itemofworkstable AS it ON dr.fldItem=it.fldID WHERE pl.fldID=:planID";
$plansStmt = $connwebjmr->prepare($plansQ);
$plansStmt->execute([":planID" => $planID]);
if ($plansStmt->rowCount() > 0) {
    $planArr = $plansStmt->fetchAll();
    foreach ($planArr as $plan) {
        $output = array();
        $projName = $plan['projName'];
        $projItem = $plan['projItem'];
        $projJob = $plan['projJob'];
        $projJobID = $plan['projJobID'];
        $rawProjStart = strtotime($plan['fldStartDate']);
        $rawProjEnd = strtotime($plan['fldEndDate']);
        $projStart = date("M d, Y", $rawProjStart);
        $projEnd = date("M d, Y", $rawProjEnd);
        $projDays = ceil(($rawProjEnd - $rawProjStart) / (60 * 60 * 24)) + 1;
        $projMH = (($plan['fldHours']) * $projDays);
        $projStatus = $plan['fldStatus'] == NULL ? "" : date("M d, Y", strtotime($plan['fldStatus']));
        $usedHours = getUsedHours($projJobID, $empNum, $plan['fldStartDate'], $plan['fldEndDate']);
        $hoursRemaining = ($projMH - $usedHours) / 60;
        $planner = getEmpName($plan['fldPlanner']);
        $plannedDate = date("M d, Y - h:i:sA", strtotime($plan['fldDatePlanned']));
        $plannedModified = date("M d, Y - h:i:sA", strtotime($plan['fldDateModified']));

        $output += ["projName" => $projName];
        $output += ["projItem" => $projItem];
        $output += ["projJob" => $projJob];
        $output += ["projStart" => $projStart];
        $output += ["projEnd" => $projEnd];
        $output += ["hoursRemaining" => $hoursRemaining];
        $output += ["projStatus" => $projStatus];
        $output += ["planner" => $planner];
        $output += ["plannedDate" => $plannedDate];
        $output += ["plannedModified" => $plannedModified];
        array_push($planDetails, $output);
        // array_push($planDetails,"$projName||$projItem||$projJob||$projStart||$projEnd||$hoursRemaining||$projStatus||$planner||$plannedDate||$plannedModified");
    }
}
#endregion

#region function
function getUsedHours($jobID, $employeeNumber, $dateStart, $dateEnd)
{
    global $connwebjmr;
    $projHours = 0;
    $hoursQ = "SELECT SUM(fldDuration) FROM dailyreport WHERE fldEmployeeNum=:employeeNumber AND fldJobRequestDescription=:jobID AND fldDate BETWEEN :dateStart AND :dateEnd";
    $hoursStmt = $connwebjmr->prepare($hoursQ);
    $hoursStmt->execute([":employeeNumber" => $employeeNumber, ":jobID" => $jobID, ":dateStart" => $dateStart, ":dateEnd" => $dateEnd]);
    $rawHours = $hoursStmt->fetchColumn();
    $projHours = $rawHours;
    return $projHours;
}
function getEmpName($employeeNumber)
{
    global $connkdt;
    $ename = NULL;
    $nameQ = "SELECT CONCAT(fldSurname,', ',fldFirstname) AS ename FROM emp_prof WHERE fldEmployeeNum=:employeeNumber";
    $nameStmt = $connkdt->prepare($nameQ);
    $nameStmt->execute([":employeeNumber" => $employeeNumber]);
    if ($nameStmt->rowCount() > 0) {
        $ename = $nameStmt->fetchColumn();
    }
    return $ename;
}
#endregion
echo json_encode($planDetails);
