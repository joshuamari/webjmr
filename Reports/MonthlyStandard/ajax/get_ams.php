<?php
#region Require Database Connections
require_once '../Includes/dbconnectwebjmr.php';
require_once '../Includes/dbconnectams.php';
require_once '../Includes/globalFunctions.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$amsArray = array();
$empStatement = "";
$employeeArray = array();
if (!empty($_POST['empArray'])) {
    $employeeArray = json_decode($_POST['empArray']);
    $implodeString = implode("','", $employeeArray);
    $empStatement = "AND fldEmployeeNum IN ('" . $implodeString . "')";
}
if (count($employeeArray) < 1) {
    die(json_encode($amsArray));
}
$yearMonth = date("Y-m");
if (!empty($_POST["yearMonth"])) {
    $yearMonth = $_POST["yearMonth"];
}

#endregion

#region main
$entriesQuery = "SELECT fldEmployeeNum AS empid, DATE(fldDT) AS `Date`, MIN( CASE WHEN fldStatus = 1 THEN fldDT END ) AS `in`, MAX( CASE WHEN fldStatus = 0 THEN fldDT END ) AS `out` FROM `timelog` WHERE fldDT LIKE :yearMonth $empStatement GROUP BY fldEmployeeNum,DATE(fldDT) ORDER BY fldEmployeeNum,fldDT";
$entriesStmt = $connams->prepare($entriesQuery);
$entriesStmt->execute([":yearMonth" => "$yearMonth%"]);
if ($entriesStmt->rowCount() > 0) {
    $entriesArr = $entriesStmt->fetchAll();
    // die(json_encode($entriesArr));
    foreach ($entriesArr as $entries) {
        $reductions = 0;
        $empid = $entries["empid"];
        $rawIn = $entries["in"];
        $rawOut = $entries["out"];
        $in_timestamp = strtotime($rawIn);
        $out_timestamp = strtotime($rawOut);
        $in_time = date("H:i:s ",  $in_timestamp);
        $out_time = date("H:i:s ", $out_timestamp);
        $currentDay = date("Y-m-d", $in_timestamp);
        $day = date("d", $in_timestamp);
        $location = getCoreLocation($empid, $currentDay);
        if (isWFH($empid, $currentDay)) {
            $reductions = (int)getReductions($in_time, $out_time, $location, $currentDay);
            $diff_in_seconds = max(0, $out_timestamp - $in_timestamp - $reductions);
            $diff_in_minutes = floor($diff_in_seconds / 60);
            $hours = floor($diff_in_seconds / 3600);
            $minutes = $diff_in_minutes % 60;
            if ($minutes >= 30) {
                $hours += 0.5;
            }
        } else {
            $new_in = checkStart($in_time, $location, $currentDay);
            $new_in_timestamp = strtotime($currentDay . " " . $new_in);

            if ($new_in !== NULL) {
                $reductions = (int)getReductions($new_in, $out_time, $location, $currentDay);
                $diff_in_seconds = max(0, $out_timestamp - $new_in_timestamp - $reductions);
                $hours = floor($diff_in_seconds / 3600);
            } else {
                $hours = 0;
            }
            // if ($currentDay == "2024-06-05") {
            //     echo $new_in . "new";
            //     echo $out_time . "out";
            //     echo $reductions . "red";
            //     echo $hours . "hrs";
            // }
            // die($new_in . " at " . $reductions);
        }
        if ($location == "1") {
            $amsArray[$empid][$day]["locationName"] = "KDT";
        } else {
            if ($location == "2") {
                $amsArray[$empid][$day]["locationName"] = "WFH";
            } else {
                $amsArray[$empid][$day]["locationName"] = "Unknown";
            }
        }
        $amsArray[$empid][$day]["hours"] = $hours;
    }
}
#endregion

#region function
function isWFH($empnum, $selectedDay)
{
    global $connwebjmr;
    global $wfhID;
    $isWFH = false;
    $wfhQ = "SELECT * FROM dailyreport WHERE fldEmployeeNum = :enum AND fldDate=:selectedDay AND fldLocation=:wfhID";
    $wfhStmt = $connwebjmr->prepare($wfhQ);
    $wfhStmt->execute([":enum" => $empnum, ":selectedDay" => $selectedDay, ":wfhID" => $wfhID]);
    if ($wfhStmt->rowCount() > 0) {
        $isWFH = true;
    }
    return $isWFH;
}
function getCoreLocation($empnum, $selectedDay)
{
    global $connwebjmr;
    $locID = 1;
    $wfhQ = "SELECT fldLocation FROM dailyreport WHERE fldEmployeeNum = :enum AND fldDate=:selectedDay LIMIT 1";
    $wfhStmt = $connwebjmr->prepare($wfhQ);
    $wfhStmt->execute([":enum" => $empnum, ":selectedDay" => $selectedDay]);
    if ($wfhStmt->rowCount() > 0) {
        $locID = $wfhStmt->fetchColumn();
    }
    return $locID;
}
function getReductions($start, $end, $location, $currentday)
{
    global $connwebjmr;
    global $wfhID;
    $reductions = 0;
    $end_stamp = strtotime($end);
    $isWFH = $location == $wfhID ? TRUE : FALSE;
    $coreStatement = " AND core_name_id NOT IN(1,2,3,5)";
    if ($isWFH) {
        $location = 1;
        $coreStatement = " AND core_name_id NOT IN(1,3)";
    }
    $redQ = "SELECT core_name_id, location_id, sd AS start, ed AS end FROM ( SELECT core_name_id, location_id, MIN(CASE WHEN core_start = 1 THEN core_time END) AS sd, MAX(CASE WHEN core_start = 0 THEN core_time END) AS ed FROM coretime WHERE effective_date = ( SELECT MAX(effective_date) FROM coretime WHERE :currentday >= effective_date AND location_id = :location_id  AND core_name_id NOT IN(1,3)) AND location_id = :location_id $coreStatement GROUP BY core_name_id ) AS subquery WHERE subquery.sd < :endTime AND subquery.ed > :startTime";
    $redStmt = $connwebjmr->prepare($redQ);
    $redStmt->execute([":currentday" => $currentday, ":location_id" => $location, ":startTime" => $start, ":endTime" => $end]);
    if ($redStmt->rowCount() > 0) {
        $redArr = $redStmt->fetchAll();
        foreach ($redArr as $red) {
            $starttime = $red["start"];
            $endtime = $red["end"];
            if ($currentday == "2024-05-06") {
                // echo $starttime . " at " . $endtime;
                // echo "ito end" . $end;
            }
            $start_timestamp = strtotime($starttime);
            $end_timestamp = strtotime($endtime);
            if ($end_stamp >= $start_timestamp && $end_stamp <= $end_timestamp) {
                $diff_in_seconds = $end_stamp - $start_timestamp;
                // echo "ito day: $currentday XD";
            } else {
                $diff_in_seconds = max(0, $end_timestamp - $start_timestamp);
            }

            // echo $diff_in_seconds / 60 . "<>";
            $reductions += $diff_in_seconds;
        }
    }
    return $reductions;
}
function checkStart($start, $location, $cur)
{
    $newStart = $start;
    $start_stamp = strtotime($start);
    $halfstart = getHalfstart($location);
    // if ($cur == "2024-06-05") {
    //     echo $location;
    //     echo "eto half: " . $halfstart;
    //     echo "eto start: " . $newStart;
    // }

    $halfstart_stamp = strtotime($halfstart);
    $halfend = getHalfend($location);
    $halfend_stamp = strtotime($halfend);

    if ($start_stamp >= $halfstart_stamp && $start_stamp <= $halfend_stamp) {
        $newStart = $halfend;
    } elseif ($start_stamp > $halfend_stamp) {
        $newStart = NULL;
    } else {
        $newStart = $start;
    }
    return $newStart;
}
function getHalfstart($location)
{
    global $connwebjmr;
    $halfday = null;
    $halfQ = "SELECT core_time FROM `coretime` AS ct JOIN `coretime_name` AS cn ON ct.core_name_id=cn.core_name_id WHERE ct.core_start = 0 AND cn.core_name = 'Time' AND ct.location_id = :location_id";
    $halfStmt = $connwebjmr->prepare($halfQ);
    $halfStmt->execute([":location_id" => $location]);
    if ($halfStmt->rowCount() > 0) {
        $halfday = $halfStmt->fetchColumn();
    } else {
        $halfStmt->execute([":location_id" => 1]);
        $halfday = $halfStmt->fetchColumn();
    }
    return $halfday;
}
function getHalfend($location)
{
    global $connwebjmr;
    $halfday = null;
    $halfQ = "SELECT core_time FROM `coretime` AS ct JOIN `coretime_name` AS cn ON ct.core_name_id=cn.core_name_id WHERE ct.core_start = 0 AND cn.core_name = 'Halfday' AND ct.location_id = :location_id";
    $halfStmt = $connwebjmr->prepare($halfQ);
    $halfStmt->execute([":location_id" => $location]);
    if ($halfStmt->rowCount() > 0) {
        $halfday = $halfStmt->fetchColumn();
    } else {
        $halfStmt->execute([":location_id" => 1]);
        $halfday = $halfStmt->fetchColumn();
    }
    return $halfday;
}

#endregion
echo json_encode($amsArray);
