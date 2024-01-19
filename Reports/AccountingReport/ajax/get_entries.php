<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$yearMonth = date("Y-m");
if (!empty($_POST['yearMonth'])) {
    $yearMonth = $_POST['yearMonth'];
}
$selYearMonth = date("Y-m-01", strtotime($yearMonth));
$loc = 'KDT';
$locStmt = " `fldLocation` <> 0 ";
if (!empty($_POST['loc'])) {
    $loc = (int)$_POST['loc'];
    $locStmt = " `fldLocation` = $loc ";
}
$dateRanges = getRanges($yearMonth);
$cutOff = 0;
if (!empty($_POST['cutOff'])) {
    $cutOff = (int)$_POST['cutOff'];
}
$dateCompare = '';
switch ($cutOff) {
    case 1:
        $dateCompare = " AND `fldDate` >= '" . $dateRanges['firstHalf']['start'] . "' AND `fldDate`<'" . $dateRanges['firstHalf']['end'] . "'";
        break;
    case 2:
        $dateCompare = " AND `fldDate` >= '" . $dateRanges['secondHalf']['start'] . "' AND `fldDate`<'" . $dateRanges['secondHalf']['end'] . "'";
        break;
    default:
        $dateCompare = " AND `fldDate` LIKE '$yearMonth-%'";
}
$entriesArray = array();
$maypasok = getMayPasok($yearMonth, $loc);
$weekendsRaw = getWeekEnds($yearMonth, $loc);
$regHolidaysRaw = getRegular($yearMonth, $loc);
$specialHolidaysRaw = getSpecial($yearMonth, $loc);
$legalRegular = array_values(array_intersect($weekendsRaw, $regHolidaysRaw));
$restdayLegalStmt = '';
if (!empty($legalRegular)) {
    $restdayLegalStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldDate` IN ('" . implode("','", $legalRegular) . "') THEN `fldDuration` ELSE 0 END) AS rd_legal";
}
$legalSpecial = array_values(array_intersect($weekendsRaw, $specialHolidaysRaw));
$restdaySpcStmt = '';
if (!empty($legalSpecial)) {
    $restdaySpcStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldDate` IN ('" . implode("','", $legalSpecial) . "') THEN `fldDuration` ELSE 0 END) AS rd_spc";
}
$regHolidays = array_diff($regHolidaysRaw, $legalRegular);
$legalOTStmt = '';
if (!empty($regHolidays)) {
    $legalOTStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldDate` IN ('" . implode("','", $regHolidays) . "') THEN `fldDuration` ELSE 0 END) AS legal_ot";
}
$specialHolidays = array_diff($specialHolidaysRaw, $legalSpecial);
$specialOTStmt = '';
if (!empty($specialHolidays)) {
    $specialOTStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldDate` IN ('" . implode("','", $specialHolidays) . "') THEN `fldDuration` ELSE 0 END) AS spc_ot";
}
$weekends = array_diff($weekendsRaw, $legalRegular, $legalSpecial);
$restdayOT = '';
if (!empty($weekends)) {
    $restdayOT = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldDate` IN ('" . implode("','", $weekends) . "') THEN `fldDuration` ELSE 0 END) AS rd_ot";
}
$nonWorkingDays = array_values(array_unique(array_merge($weekendsRaw, $regHolidaysRaw, $specialHolidaysRaw)));
$regOTStmt = '';
if (!empty($nonWorkingDays)) {
    $regOTStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldDate` NOT IN ('" . implode("','", $nonWorkingDays) . "') THEN `fldDuration` ELSE 0 END) AS reg_ot";
}


$report_data = array();
//employee query here
$allEmpQ = "SELECT `fldEmployeeNum`,CONCAT(`fldSurname`,', ',`fldFirstname`)  AS ename FROM emp_prof WHERE fldNick<>'' AND (fldResignDate IS NULL OR fldResignDate>:selYearMonth) ORDER BY fldEmployeeNum";
$elStmt = $connkdt->prepare($allEmpQ);
$elStmt->execute([":selYearMonth" => $selYearMonth]);
if ($elStmt->rowCount() > 0) {
    $elArr = $elStmt->fetchAll();
    foreach ($elArr as $el) {
        $enum = $el['fldEmployeeNum'];
        $ename = $el['ename'];
        $report_data[$enum]['name'] = $ename;
    }
}

#endregion

#region main
$entriesQuery = "SELECT
`fldEmployeeNum`,
SUM(
    CASE WHEN `fldMHType` = 0 THEN `fldDuration` ELSE 0
END
) AS totalreg,
SUM(
CASE WHEN `fldMHType` = 1 THEN `fldDuration` ELSE 0
END
) AS totalot,
SUM(
CASE WHEN `fldProject` = :leaveID THEN `fldDuration`
END
) AS totallv,
SUM(
CASE WHEN `fldProject` != :leaveID THEN `fldDuration` ELSE 0
END
) AS totalmh $regOTStmt $restdayOT $legalOTStmt $restdayLegalStmt $specialOTStmt $restdaySpcStmt
FROM
    `dailyreport`
WHERE
$locStmt
$dateCompare
GROUP BY
    `fldEmployeeNum`
";
$entriesStmt = $connwebjmr->prepare($entriesQuery);
$entriesStmt->execute([":leaveID" => $leaveID]);
if ($entriesStmt->rowCount() > 0) {
    $entriesArr = $entriesStmt->fetchAll();
    foreach ($entriesArr as $ent) {
        $empid = $ent['fldEmployeeNum'];
        $totalReg = $ent['totalreg'];
        $totalOT = $ent['totalot'];
        $totalLeave = $ent['totallv'];
        $totalMH = $ent['totalmh'];
        if (array_key_exists('reg_ot', $ent)) {
            $regularOT = $ent['reg_ot'];
            if ($regularOT) {
                $report_data[$empid]['regularOT'] = $regularOT / 60;
            }
        }
        if (array_key_exists('rd_ot', $ent)) {
            $rdOT = $ent['rd_ot'];
            if ($rdOT) {
                $report_data[$empid]['rdOT'] = $rdOT / 60;
            }
        }
        if (array_key_exists('legal_ot', $ent)) {
            $legalOT = $ent['legal_ot'];
            if ($legalOT) {
                $report_data[$empid]['legalOT'] = $legalOT / 60;
            }
        }
        if (array_key_exists('rd_legal', $ent)) {
            $rdLegal = $ent['rd_legal'];
            if ($rdLegal) {
                $report_data[$empid]['rdLegal'] = $rdLegal / 60;
            }
        }
        if (array_key_exists('spc_ot', $ent)) {
            $spcOT = $ent['spc_ot'];
            if ($spcOT) {
                $report_data[$empid]['spcOT'] = $spcOT / 60;
            }
        }
        if (array_key_exists('rd_spc', $ent)) {
            $rdSpc = $ent['rd_spc'];
            if ($rdSpc) {
                $report_data[$empid]['rdSpc'] = $rdSpc / 60;
            }
        }


        if ($totalReg) {
            $report_data[$empid]['totalReg'] = $totalReg / 60;
        }
        if ($totalOT) {
            $report_data[$empid]['totalOT'] = $totalOT / 60;
        }
        if ($totalLeave) {
            $report_data[$empid]['totalLeave'] = $totalLeave / 60;
        }
        if ($totalMH) {
            $report_data[$empid]['totalMH'] = $totalMH / 60;
        }
    }
}
#endregion
// ksort($report_data);
echo json_encode($report_data);
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
function getMayPasok($yearMonth, $loc)
{
    global $connkdt;
    $dates = array();
    $dateQ = "SELECT * FROM kdtholiday WHERE fldLocation=:loc AND fldDate LIKE :yearMonth AND fldHolidayType=2";
    $dateStmt = $connkdt->prepare($dateQ);
    $dateStmt->execute([":loc" => $loc, ":yearMonth" => "$yearMonth-%"]);
    if ($dateStmt->rowCount() > 0) {
        $datesArr = $dateStmt->fetchAll();
        foreach ($datesArr as $dt) {
            array_push($dates, $dt['fldDate']);
        }
    }
    return $dates;
}
function getWeekEnds($yearMonth, $loc)
{
    global $maypasok;
    $dates = array();
    list($year, $month) = explode('-', $yearMonth);

    $startDate = strtotime("$year-$month-01");
    $endDate = strtotime(date("Y-m-t", strtotime("$year-$month-01")));

    $dates = array();

    while ($startDate <= $endDate) {
        // Check if the current day is Sunday (0) or Saturday (6)
        if ((date("w", $startDate) == 0 || date("w", $startDate) == 6) && !in_array(date("Y-m-d", $startDate), $maypasok)) {
            $dates[] = date("Y-m-d", $startDate);
        }

        // Move to the next day
        $startDate = strtotime("+1 day", $startDate);
    }

    return $dates;
}
function getRegular($yearMonth, $loc)
{
    global $connkdt;
    $dates = array();
    $dateQ = "SELECT * FROM kdtholiday WHERE fldLocation=:loc AND fldDate LIKE :yearMonth AND fldHolidayType=0";
    $dateStmt = $connkdt->prepare($dateQ);
    $dateStmt->execute([":loc" => $loc, ":yearMonth" => "$yearMonth-%"]);
    if ($dateStmt->rowCount() > 0) {
        $datesArr = $dateStmt->fetchAll();
        foreach ($datesArr as $dt) {
            array_push($dates, $dt['fldDate']);
        }
    }
    return $dates;
}
function getSpecial($yearMonth, $loc)
{
    global $connkdt;
    $dates = array();
    $dateQ = "SELECT * FROM kdtholiday WHERE fldLocation=:loc AND fldDate LIKE :yearMonth AND fldHolidayType=1";
    $dateStmt = $connkdt->prepare($dateQ);
    $dateStmt->execute([":loc" => $loc, ":yearMonth" => "$yearMonth-%"]);
    if ($dateStmt->rowCount() > 0) {
        $datesArr = $dateStmt->fetchAll();
        foreach ($datesArr as $dt) {
            array_push($dates, $dt['fldDate']);
        }
    }
    return $dates;
}
function getRanges($yearmonth)
{
    $middleDayTimestamp = strtotime('+14 days', strtotime($yearmonth . '-01'));
    $middleDate = date('Y-m-d', $middleDayTimestamp);

    $lastDay = date('Y-m-t', strtotime($yearmonth . '-01'));

    $firstHalfStartDate = date('Y-m-01', strtotime($yearmonth));
    $firstHalfEndDate = $middleDate;

    $secondHalfStartDate = date('Y-m-d', strtotime($middleDate . '+1 day'));
    $secondHalfEndDate = $lastDay;

    return [
        'firstHalf' => ['start' => $firstHalfStartDate, 'end' => $firstHalfEndDate],
        'secondHalf' => ['start' => $secondHalfStartDate, 'end' => $secondHalfEndDate],
    ];
}
#endregion