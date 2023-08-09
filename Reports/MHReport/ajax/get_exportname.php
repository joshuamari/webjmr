<?php
require_once '../Includes/globalFunctions.php';

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$ymSel = NULL;
if (!empty($_POST['ymSel'])) {
    $ymSel = $_POST['ymSel'];
}
$cutOff = "1";
if (isset($_POST['cOff'])) {
    $cutOff = $_POST['cOff'];
}
$cOff = "Monthly";
$firstDay = getFirstday($ymSel, $cutOff);
// $lastDay = getLastday($ymSel, $cutOff, $firstDay);
#endregion

switch ($cutOff) {
    case "1":
        $cOff = "FirstHalf";
        break;
    case "3":
        $cOff = "Monthly";
        break;
    case "4":
        $cOff = "Week" . getWeekNumberInMonth($firstDay);
        $ymSel = date("Y-m", strtotime($firstDay));
        break;
    case "5":
        $cOff = "Week" . getWeekNumberInMonth($firstDay);
        $ymSel = date("Y-m", strtotime($firstDay));
        break;
}
echo $ymSel . "_" . $cOff;
#region function
function getWeekNumberInMonth($myDate)
{
    $firstDayOfMonth = strtotime(date("Y-m-01", strtotime($myDate)));
    $currentWeekNumber = ceil(date("j", $firstDayOfMonth) / 7);

    $targetDate = strtotime($myDate);
    $targetWeekNumber = ceil(date("j", $targetDate) / 7);

    return "0" . $targetWeekNumber - $currentWeekNumber + 1;
}
#endregion