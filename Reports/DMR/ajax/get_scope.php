<?php
#region Require Database Connections
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$yearMonth = date("Y-m-01");
if (!empty($_POST['monthSel'])) {
    $yearMonth = $_POST['monthSel'];
}
$rawFirstDay = strtotime($yearMonth . '-01');
$lastMonday = date("Y-m-d", $rawFirstDay);
$firstDayOfWeek = date('N', $rawFirstDay);
$rawLastDay = strtotime('last day of ' . $yearMonth);
$nextSunday = date("Y-m-d", $rawLastDay);
$lastDayOfWeek = date('N', $rawLastDay);
$scopeArray = array();
#endregion

#region main
if ($firstDayOfWeek !== 1) {
    $lastMondayTimestamp = strtotime("last monday", $rawFirstDay);
    $lastMonday = date('Y-m-d', $lastMondayTimestamp);
}


if ($lastDayOfWeek !== 7) {
    $nextSundayTimestamp = strtotime("next sunday", $rawLastDay);
    $nextSunday = date('Y-m-d', $nextSundayTimestamp);
}

$scopeArray['firstDay'] = $lastMonday;
$scopeArray['lastDay'] = $nextSunday;
#endregion

#region function

#endregion
echo json_encode($scopeArray);
