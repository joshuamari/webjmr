<?php
#region Require Database Connections
require_once '../dbconn/dbconnectkdtph.php';
require_once '../dbconn/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$reportData = array();
$empSelect = NULL;
if (!empty($_POST['empSelect'])) {
    $empSelect = $_POST['empSelect'];
}
$ymSelect = date("Y-m");
if (!empty($_POST['ymSelect'])) {
    $ymSelect  = $_POST['ymSelect'];
}
$locSelect = 1;
$locStmt = ' AND dr.fldLocation IN (1,2)';
if (!empty($_POST['locSelect'])) {
    $locSelect = (int)$_POST['locSelect'];
    $locStmt = " AND dr.fldLocation =$locSelect";
}
$uniqueCols = ["pt.fldProject", "it.fldItem", "jrd.fldJob"];
$columnMap = [
    'proj' => 'pt.fldProject',
    'item' => 'it.fldItem',
    'job' => 'jrd.fldJob',
    'tow' => 'tw.fldTow',
    'rem' => 'dr.fldRemarks',
];
$columnsRaw = [];
if (isset($_POST['selColumns'])) {
    $columnsRaw = json_decode($_POST['selColumns']);
}
if (!$columnsRaw) {
    die(json_encode($reportData, JSON_PRETTY_PRINT));
}

$selectedColumns = [];
foreach ($columnsRaw as $col) {
    $selectedColumns[] = $columnMap[$col];
}
$columnsStmt = "dr.fldDate, SUM(dr.fldDuration) AS mins, dr.fldMHType, pt.fldID AS projid, pt.fldOrder, jrd.fldKHIC, " . implode(', ', $selectedColumns);
$grpByRaw = array_intersect($selectedColumns, $uniqueCols);
$grpByStmt = '';
if (count($grpByRaw) > 0) {
    $grpByStmt = "GROUP BY dr.fldDate, dr.fldMHType, " . implode(', ', $grpByRaw);
}
$exclude = FALSE;
$excludeStmt = '';
if (isset($_POST['exclude'])) {
    $exclude = json_decode($_POST['exclude']);
    if ($exclude) {
        $excludeStmt = ' AND (pt.fldDirect<>0 OR pt.fldID = 6)';
    }
}
$hoursChecked = FALSE;
if (!empty($_POST['hrsChk'])) {
    $hoursChecked = json_decode($_POST['hrsChk']);
}
$coretime = new stdClass();
if (isset($_POST['core'])) {
    $coretime = json_decode($_POST['core']);
} else {
    die(json_encode($reportData, JSON_PRETTY_PRINT));
}
$amT = getHDTow('Leave AM');
$pmT = getHDTow('Leave PM');
$reportQ = "SELECT CASE WHEN dr.fldTow IN (:amTow,:pmTow) THEN dr.fldTow ELSE NULL END AS isHalfDay, $columnsStmt FROM `dailyreport` AS dr LEFT JOIN `projectstable` AS pt ON dr.fldProject=pt.fldID LEFT JOIN `itemofworkstable` AS it ON dr.fldItem=it.fldID LEFT JOIN `drawingreference` AS jrd ON dr.fldJobRequestDescription=jrd.fldID LEFT JOIN `typesofworktable` AS tw ON dr.fldTOW = tw.fldID WHERE dr.fldEmployeeNum=:empSelect AND dr.fldDate LIKE :ymSelect $locStmt $excludeStmt $grpByStmt ORDER BY dr.fldDate";
$reportStmt = $connwebjmr->prepare($reportQ);
#endregion

#region main
$reportStmt->execute([":ymSelect" => "$ymSelect%", ":empSelect" => $empSelect, ":amTow" => $amT, ":pmTow" => $pmT]);
if ($reportStmt->rowCount() > 0) {
    $repArr = $reportStmt->fetchAll();
    foreach ($repArr as $rep) {
        $repDate = date("d", strtotime($rep['fldDate']));
        $hrs = $rep['mins'] / 60;
        $isOT = $rep['fldMHType'] == "1" ? true : false;
        $projid = (int)$rep['projid'];
        $orderNum = $rep['fldOrder'];
        $khic = $rep['fldKHIC'];
        $isHalf = $rep['isHalfDay'];
        #region description
        $dsc = '';
        foreach ($selectedColumns as $col) {
            $clmnArr = explode('.', $col);
            $clmn = implode('.', array_slice($clmnArr, 1));
            $clmnVal = $rep[$clmn];
            if ($clmnVal) {
                $dsc .= "$clmnVal : ";
            }
        }
        $dsc = rtrim($dsc, ' : ');
        if ($hoursChecked) {
            $hrSuff = $hrs > 1 ? "hours" : "hour";
            $dsc .= " ($hrs $hrSuff)";
        }

        if (isset($reportData[$repDate]['desc'])) {
            if (!in_array(extractProjectName($dsc)[0], extractProjectName($reportData[$repDate]['desc']))) {
                $reportData[$repDate]['desc'] .= " | " . $dsc;
            } else {
                if ($hoursChecked) {
                    list($projectNameToUpdate, $hoursToUpdate) = explode('(', rtrim($dsc, ')'));
                    $hoursToUpdate = trim($hoursToUpdate, ' hours'); // Remove ' hours' suffix
                    $reportData[$repDate]['desc'] = updateProjectHours($reportData[$repDate]['desc'], ['name' => trim($projectNameToUpdate), 'hours' => trim($hoursToUpdate)]);
                }
            }
        } else {
            $reportData[$repDate]['desc'] = $dsc;
        }
        #endregion
        #region hours
        if ($projid !== $leaveID) {
            if (isset($reportData[$repDate]['hours'])) {
                $reportData[$repDate]['hours'] += $hrs;
            } else {
                $reportData[$repDate]['hours'] = $hrs;
            }
        }
        #endregion
        #region range
        if (isset($reportData[$repDate]['hours'])) {
            $range = getTimeRange($coretime, $reportData[$repDate]['hours'], $isHalf);
            if ($range) {
                $reportData[$repDate]['start'] = $range['startTime'];
                $reportData[$repDate]['end'] = $range['endTime'];
            }
        }
        #endregion
        #region OT
        if ($isOT) {
            if (isset($reportData[$repDate]['ot'])) {
                $reportData[$repDate]['ot'] += $hrs;
            } else {
                $reportData[$repDate]['ot'] = $hrs;
            }
        }
        #endregion
        #region ordernum
        if ($orderNum) {
            if (!isset($reportData[$repDate]['order'])) {
                $reportData[$repDate]['order'] = $orderNum;
            }
        }
        #endregion
        #region pic
        if ($khic) {
            if (!isset($reportData[$repDate]['khic'])) {
                $reportData[$repDate]['khic'] = $khic;
            }
        }
        #endregion

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
function extractProjectName($desc)
{
    $projectsWithoutHours = array_map(function ($project) {
        $lastParenIndex = strrpos($project, '(');
        if ($lastParenIndex !== false) {
            return trim(substr($project, 0, $lastParenIndex));
        } else {
            return trim($project);
        }
    }, explode('|', $desc));

    return $projectsWithoutHours;
}
function updateProjectHours($string, $projectToUpdate)
{
    $projects = explode('|', $string);

    foreach ($projects as &$project) {
        $lastParenIndex = strrpos($project, '(');
        $projectName = trim(substr($project, 0, $lastParenIndex));

        if ($projectName === $projectToUpdate['name']) {
            // Extract existing hours and add new hours
            $existingHours = (int) trim(substr($project, $lastParenIndex + 1));
            $newHours = (int) $projectToUpdate['hours'];
            $updatedHours = $existingHours + $newHours;

            // Update the hours for the matching project
            $project = $projectName . ' (' . $updatedHours . ' hours)';
        }
    }

    return implode(' | ', $projects);
}
function getTimeRange($core, $duration, $isHalfDay)
{
    global $pmT;
    global $amT;
    // Extracting values from the $core array

    $lunchStart = $core->Lunch->start;
    $lunchEnd = $core->Lunch->end;
    $dinnerStart = $core->Dinner->start;
    $dinnerEnd = $core->Dinner->end;
    // $timeEnd = $core->Time->end; //irrelevant
    $halfdayStart = $core->Halfday->start;
    $halfdayEnd = $core->Halfday->end;
    if ($isHalfDay == $pmT) {
        $timeStart = $halfdayEnd;
    } else if ($isHalfDay == $amT && $duration == 4) {
        $timeStart = date("H:i", strtotime($halfdayStart) - ($duration * 3600));
    } else {
        $timeStart = $core->Time->start;
    }
    // Calculate break times in seconds
    $lunchBreakSeconds = strtotime($lunchEnd) - strtotime($lunchStart);
    $dinnerBreakSeconds = strtotime($dinnerEnd) - strtotime($dinnerStart);

    // Calculate actual working end time
    $workingEnd = strtotime($timeStart) + ($duration * 3600);
    if (strtotime($lunchStart) >= strtotime($timeStart) && strtotime($lunchEnd) <= $workingEnd) {

        $workingEnd += $lunchBreakSeconds;
    }
    if (strtotime($dinnerStart) >= strtotime($timeStart) && strtotime($dinnerEnd) <= $workingEnd) {
        $workingEnd += $dinnerBreakSeconds;
    }

    // Format times for output
    $timeStartFormatted = date('H:i', strtotime($timeStart));
    $workingEndFormatted = date('H:i', $workingEnd);

    // Return the start time and end time as an array
    return [
        'startTime' => $timeStartFormatted,
        'endTime' => $workingEndFormatted
    ];
}
function getHDTow($towValue)
{
    global $connwebjmr;
    $hdTow = NULL;

    $hdQ = "SELECT fldID FROM `typesofworktable` WHERE `fldTOW` = :towValue";
    $hdStmt = $connwebjmr->prepare($hdQ);
    $hdStmt->execute([":towValue" => $towValue]);

    if ($hdStmt->rowCount() > 0) {
        $hdTow = $hdStmt->fetchColumn();
    }

    return $hdTow;
}
#endregion
echo json_encode($reportData, JSON_PRETTY_PRINT);
// echo json_encode($locStmt, JSON_PRETTY_PRINT);
