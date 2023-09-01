<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$groupSel = NULL;
$groupStatement = "";
if (!empty($_POST['groupSel'])) {
    $groupSel = $_POST['groupSel'];
}
$firstDay = '';
if (!empty($_POST['firstDay'])) {
    $firstDay = $_POST['firstDay'];
}
$lastDay = '';
if (!empty($_POST['lastDay'])) {
    $lastDay = $_POST['lastDay'];
}
$projSel = NULL;
if (!empty($_POST['projSel'])) {
    $projSel = $_POST['projSel'];
    $projStatement = "AND dr.fldProject ='$projSel'";
}
$empSel = array();
if (!empty($_POST['empSel'])) {
    $empSel = $_POST['empSel'];
}
$entriesArray = array();

#endregion

#region main
$entriesQuery = "SELECT pt.fldID AS projID,pt.fldProject,it.fldItem,jrd.fldJob,jrd.fldID AS jobID,dr.fldEmployeeNum,dr.fldDate,dr.fldDuration,(SELECT SUM(fldDuration) FROM dailyreport WHERE fldEmployeeNum=dr.fldEmployeeNum AND fldJobRequestDescription=jrd.fldID AND fldDate BETWEEN :fDay AND :lDay) AS mhused,(SELECT fldHours FROM planning WHERE fldEmployeeNum=dr.fldEmployeeNum AND fldJob=jrd.fldID AND dr.fldDate BETWEEN fldStartDate AND fldEndDate) AS planned,jrd.fldDrawingName,jrd.fldKHIC,jrd.fldKHIDate,jrd.fldKHIDeadline,jrd.fldKDTDeadline FROM `dailyreport` AS dr JOIN projectstable AS pt ON pt.fldID=dr.fldProject JOIN itemofworkstable AS it ON dr.fldItem=it.fldID JOIN drawingreference AS jrd ON dr.fldJobRequestDescription=jrd.fldID WHERE pt.fldGroup IS NOT NULL $projStatement AND dr.`fldEmployeeNum` IN (461,460) AND fldDate BETWEEN :fDay AND :lDay AND pt.fldGroup = :groupSel ORDER BY dr.fldEmployeeNum,dr.fldDate";
$entriesStmt = $connwebjmr->prepare($entriesQuery);
$entriesStmt->execute([":fDay" => $firstDay, ":lDay" => $lastDay, ":groupSel" => $groupSel]);
$entriesArr = $entriesStmt->fetchAll();
foreach ($entriesArr as $ent) {
    $projID = $ent['projID'];
    $projName = $ent['fldProject'];
    $itemName = $ent['fldItem'];
    $jobID = $ent['jobID'];
    $jobName = $ent['fldJob'];
    $enum = $ent['fldEmployeeNum'];
    $ename = getName($enum);
    $entryDate = $ent['fldDate'];
    $dur = $ent['fldDuration'] / 60;
    $mhUsed = $ent['mhused'] / 60;
    $planned = $ent['planned'] == NULL ? 0 : $ent['planned'] / 60;
    $drawName = $ent['fldDrawingName'];
    $khic = $ent['fldKHIC'];
    $khiReq = $ent['fldKHIDate'];
    $khiDead = $ent['fldKHIDeadline'];
    $kdtDead = $ent['fldKDTDeadline'];
    $planDeets = getPlanDeets($jobID, $enum, $firstDay, $lastDay);

    $entriesArray[$projName]['pNum'] = $projID;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['jobNum'] = $jobID;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['dName'] = $drawName;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['kic'] = $khic;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['khiRequest'] = $khiReq;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['startDate'] = $khiReq;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['kdtDeadline'] = $kdtDead;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['mUsed'] = $mhUsed;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['pStatus'] = "ongoing";

    $entriesArray[$projName]['Items'][$itemName][$jobName]['Members'][$enum]["Dates"][$entryDate]['Actual'] = $dur;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['Members'][$enum]["Dates"][$entryDate]['Planned'] = $planned;

    foreach ($planDeets as $pds) {
        $planDates = $pds['Dates'];
        $planHrs = $pds['planned'];
        foreach ($planDates as $pd) {
            if (!array_key_exists($pd, $entriesArray[$projName]['Items'][$itemName][$jobName]['Members'][$enum]["Dates"])) {
                $entriesArray[$projName]['Items'][$itemName][$jobName]['Members'][$enum]["Dates"][$pd]['Actual'] = 0;
                $entriesArray[$projName]['Items'][$itemName][$jobName]['Members'][$enum]["Dates"][$pd]['Planned'] = $planHrs;
            }
        }
    }
}
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
function getPlanDeets($jNum, $eNum, $fDate, $lDate)
{
    global $connwebjmr;
    $planDeets = array();
    $planQuery = "SELECT * FROM planning WHERE fldJob = :jNum AND fldEmployeeNum = :eNum AND fldStartDate <= :lDate AND fldEndDate >= :fDate";
    $planStmt = $connwebjmr->prepare($planQuery);
    $planStmt->execute([":jNum" => $jNum, ":eNum" => $eNum, ":fDate" => $fDate, ":lDate" => $lDate]);
    $planArr = $planStmt->fetchAll();
    foreach ($planArr as $pl) {
        $planDates = array();
        $curDate = strtotime($pl['fldStartDate']);
        $endDate = strtotime($pl['fldEndDate']);
        $planned = $pl['fldHours'] / 60;
        $planID = $pl['fldID'];
        $planDeets[$planID]['planned'] = $planned;
        while ($curDate <= $endDate) {
            $planDates[] = date("Y-m-d", $curDate);
            $curDate = strtotime('+1 day', $curDate);
        }
        $planDeets[$planID]['Dates'] = $planDates;
    }
    return $planDeets;
}
#endregion
echo "<pre>";
echo json_encode($entriesArray, JSON_PRETTY_PRINT);
echo "</pre>";
