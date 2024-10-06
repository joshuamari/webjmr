<?php
#region Require Database Connections
require_once "../../dbconn/dbconnectkdtph.php";
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "./global_var.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$getEmployee = NULL;
if (!empty($_POST['getEmployee'])) {
    $getEmployee = $_POST['getEmployee'];
}
$selDate = date("Y-m-d");
if (!empty($_POST['selDate'])) {
    $selDate = $_POST['selDate'];
}
$planned = array();
#endregion

#region main
$plansQ = "SELECT pl.*,dr.fldID AS projJobID, dr.fldJob AS projJob,pt.fldProject AS projName,it.fldItem AS projItem FROM planning AS pl JOIN drawingreference AS dr ON pl.fldJob=dr.fldID JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN itemofworkstable AS it ON dr.fldItem=it.fldID WHERE pl.fldEmployeeNum=:getEmployee AND :selDate BETWEEN pl.fldStartDate AND pl.fldEndDate ORDER BY pl.fldStartDate DESC";
$plansStmt = $connwebjmr->prepare($plansQ);
$plansStmt->execute([":getEmployee" => $getEmployee, ":selDate" => $selDate]);
if ($plansStmt->rowCount() > 0) {
    $planArr = $plansStmt->fetchAll();
    foreach ($planArr as $plan) {
        $output = array();
        $planID = $plan['fldID'];
        $projName = $plan['projName'];
        $projItem = $plan['projItem'];
        $projJob = $plan['projJob'];
        $projJobID = $plan['projJobID'];
        $projMH = ($plan['fldHours']) / 60;
        $usedHours = getUsedHours($projJobID, $getEmployee, $plan['fldStartDate'], $plan['fldEndDate']);
        $projStatus = $plan['fldStatus'];
        if ($projStatus != NULL) {
            $projStatus = date("M d, Y", strtotime($projStatus));
        }
        $output += ["planID" => $planID];
        $output += ["projName" => $projName];
        $output += ["projItem" => $projItem];
        $output += ["projJob" => $projJob];
        $output += ["projMH" => $projMH];
        $output += ["usedHours" => $usedHours];
        $output += ["projStatus" => $projStatus];
        array_push($planned, $output);
        // array_push($planned,"$planID||$projName||$projJob||$projEnd||$projMH||$usedHours||$projStatus");
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
    $projHours = $rawHours / 60;
    return $projHours;
}
#endregion
echo json_encode($planned);
