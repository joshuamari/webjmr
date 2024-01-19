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
$projStatement = "";
if (!empty($_POST['projSel'])) {
    $projSel = $_POST['projSel'];
    $projStatement = "AND dr.fldProject ='$projSel'";
}
$empSel = array();
if (!empty($_POST['empSel'])) {
    $empSel = $_POST['empSel'];
    $implodeString = implode("','", $empSel);
    $mgaEmp = "('" . $implodeString . "')";
}
$entriesArray = array();

#endregion

#region main
$entriesQuery = "SELECT pt.fldDirect,pt.fldID AS projID,pt.fldProject,it.fldItem,jrd.fldJob,jrd.fldID AS jobID,dr.fldEmployeeNum,dr.fldDate,SUM(dr.fldDuration) AS duration,(SELECT SUM(fldDuration) FROM dailyreport WHERE fldEmployeeNum=dr.fldEmployeeNum AND (
    (fldJobRequestDescription = jrd.fldID AND fldProject <> 5)
    OR
    (fldItem = it.fldID AND fldProject = 5)
  ) AND fldDate BETWEEN :fDay AND :lDay) AS mhused,(SELECT fldHours FROM planning WHERE fldEmployeeNum=dr.fldEmployeeNum AND fldJob=jrd.fldID AND dr.fldDate BETWEEN fldStartDate AND fldEndDate) AS planned,jrd.fldNoSheets,jrd.fldDrawingName,jrd.fldKHIC,jrd.fldKHIDate,jrd.fldKHIDeadline,jrd.fldKDTDeadline FROM `dailyreport` AS dr LEFT JOIN projectstable AS pt ON pt.fldID=dr.fldProject LEFT JOIN itemofworkstable AS it ON dr.fldItem=it.fldID LEFT JOIN drawingreference AS jrd ON dr.fldJobRequestDescription=jrd.fldID WHERE dr.`fldEmployeeNum` IN $mgaEmp AND fldDate BETWEEN :fDay AND :lDay $projStatement AND ((pt.fldGroup IS NULL AND dr.fldGroup=:groupSel) OR (pt.fldGroup = :groupSel)) AND pt.fldID<>6 GROUP BY dr.fldEmployeeNum,dr.fldJobRequestDescription,dr.fldDate ORDER BY pt.fldDirect DESC,pt.fldProject,dr.fldEmployeeNum,dr.fldDate";
$entriesStmt = $connwebjmr->prepare($entriesQuery);
$entriesStmt->execute([":fDay" => $firstDay, ":lDay" => $lastDay, ":groupSel" => $groupSel]);
$entriesArr = $entriesStmt->fetchAll();
foreach ($entriesArr as $ent) {
    $projDirect = $ent['fldDirect'] == 0 ? FALSE : TRUE;
    $projID = $ent['projID'];
    $projName = $ent['fldProject'];
    $itemName = $ent['fldItem'];
    $jobID = $ent['jobID'];
    $jobName = $ent['fldJob'];
    $enum = $ent['fldEmployeeNum'];
    $ename = getName($enum);
    $entryDate = $ent['fldDate'];
    $rawDur = $ent['duration'] / 60;
    $dur = $rawDur == (int)$rawDur ? sprintf("%.0f", $rawDur) : sprintf("%.1f", $rawDur);
    $rawMHUsed = $ent['mhused'] / 60;
    $mhUsed = $rawMHUsed == (int)$rawMHUsed ? sprintf("%.0f", $rawMHUsed) : sprintf("%.1f", $rawMHUsed);
    $planned = $ent['planned'] == NULL ? 0 : $ent['planned'] / 60;
    $noSheets = $ent['fldNoSheets'];
    $drawName = $ent['fldDrawingName'];
    $khic = $ent['fldKHIC'];
    $khiReq = $ent['fldKHIDate'];
    $khiDead = $ent['fldKHIDeadline'];
    $kdtDead = $ent['fldKDTDeadline'];
    $planDeets = getPlanDeets($jobID, $enum, $firstDay, $lastDay);

    $entriesArray[$projName]['pNum'] = $projID;
    $entriesArray[$projName]['Direct'] = $projDirect;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['jobNum'] = $jobID;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['sheets'] = $noSheets;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['dName'] = $drawName;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['kic'] = $khic;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['khiRequest'] = $khiReq;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['startDate'] = $khiReq;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['kdtDeadline'] = $kdtDead;
    // $entriesArray[$projName]['Items'][$itemName][$jobName]['mUsed'] = $mhUsed;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['Members'][$enum]['pStatus'] = "ongoing";
    $entriesArray[$projName]['Items'][$itemName][$jobName]['Members'][$enum]["name"] = $ename;
    $entriesArray[$projName]['Items'][$itemName][$jobName]['Members'][$enum]["mUsed"] = $mhUsed;
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
echo json_encode($entriesArray, JSON_PRETTY_PRINT);
