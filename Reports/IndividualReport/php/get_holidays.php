<?php
#region DB Connect
require_once '../dbconn/dbconnectkdtph.php';
require_once '../dbconn/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$selLoc = 1;
$locDefaults = [0, 1, 2];
if (isset($_POST['selLoc'])) {
    if (!empty(json_decode($_POST['selLoc'])) && !in_array(json_decode($_POST['selLoc']), $locDefaults)) {
        $selLoc = json_decode($_POST['selLoc']);
    }
}
$locName = getLocName($selLoc);
$ymSel = date("Y-m");
if (!empty($_POST['ymSel'])) {
    $ymSel = date("Y-m", strtotime($_POST['ymSel']));
}
$holidates = [];
#endregion

#region main query
try {
    getWeekendDates($ymSel, $locName);
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}

#endregion
#region FUNCTIONS
function getLocName($locID)
{
    global $connwebjmr;
    $locName = '';
    $locQ = "SELECT fldLocation FROM `dispatch_locations` WHERE `fldID` = :locID AND fldActive = 1";
    $locStmt = $connwebjmr->prepare($locQ);
    $locStmt->execute([":locID" => $locID]);
    if ($locStmt->rowCount() > 0) {
        $locName = $locStmt->fetchColumn();
    }
    return $locName;
}
function isWorkDay($selDate, $loc)
{
    global $connkdt;
    $isWorkday = TRUE;
    if (date('N', strtotime($selDate)) >= 6) {
        $isWorkday = FALSE;
    }
    $workDayQ = "SELECT fldHolidayType FROM kdtholiday WHERE fldDate=:selDate AND fldLocation=:loc";
    $workDayStmt = $connkdt->prepare($workDayQ);
    $workDayStmt->execute([":selDate" => $selDate, ":loc" => $loc]);
    $workDayType = $workDayStmt->fetchColumn();
    if ($workDayStmt->rowCount() > 0) {
        if ($workDayType != "2") {
            $isWorkday = FALSE;
        } else {
            $isWorkday = TRUE;
        }
    }
    return $isWorkday;
}
function getWeekendDates($yearMonth, $loc)
{
    global $holidates;
    global $locName;
    $firstDay = strtotime(date("Y-m-01", strtotime($yearMonth)));
    $lastDay = strtotime(date("Y-m-t", strtotime($yearMonth)));
    while ($firstDay <= $lastDay) {
        if (!isWorkDay(date("Y-m-d", $firstDay), $locName)) {
            array_push($holidates, (int)date("d", $firstDay));
        }

        $firstDay = strtotime('+1 day', $firstDay);
    }
}
#endregion
echo json_encode($holidates);
