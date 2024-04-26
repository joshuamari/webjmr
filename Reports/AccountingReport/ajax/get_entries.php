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
// $locStmt = " `fldLocation` <> 0 ";
// if (!empty($_POST['loc'])) {
//     $loc = (int)$_POST['loc'];
//     $locStmt = " `fldLocation` = $loc ";
// }
$dateRanges = getRanges($yearMonth);
// echo json_encode($dateRanges);
// die();
$cutOff = 0;
if (!empty($_POST['cutOff'])) {
    $cutOff = (int)$_POST['cutOff'];
}
$dateCompare = '';
switch ($cutOff) {
    case 1:
        $dateCompare = " AND `fldDate` >= '" . $dateRanges['firstHalf']['start'] . "' AND `fldDate`<='" . $dateRanges['firstHalf']['end'] . "'";
        break;
    case 2:
        $dateCompare = " AND `fldDate` >= '" . $dateRanges['secondHalf']['start'] . "' AND `fldDate`<='" . $dateRanges['secondHalf']['end'] . "'";
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
$restdayLegalBeyondStmt = '';
if (!empty($legalRegular)) {
    $restdayLegalStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldLocation` = 1 AND `fldDate` IN ('" . implode("','", $legalRegular) . "') THEN LEAST(`fldDuration`,480) ELSE 0 END) AS rd_legal";
    $restdayLegalBeyondStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldLocation` = 1 AND `fldDate` IN ('" . implode("','", $legalRegular) . "') AND `fldDuration` > 480 THEN `fldDuration` - 480 ELSE 0 END) AS rd_legalbeyond";
}
$legalSpecial = array_values(array_intersect($weekendsRaw, $specialHolidaysRaw));
$restdaySpcStmt = '';
$restdaySpcBeyondStmt = '';
if (!empty($legalSpecial)) {
    $restdaySpcStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldLocation` = 1 AND `fldDate` IN ('" . implode("','", $legalSpecial) . "') THEN LEAST(`fldDuration`,480) ELSE 0 END) AS rd_spc";
    $restdaySpcBeyondStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldLocation` = 1 AND `fldDate` IN ('" . implode("','", $legalSpecial) . "') AND `fldDuration` > 480 THEN `fldDuration` - 480 ELSE 0 END) AS rd_spcbeyond";
}
$regHolidays = array_diff($regHolidaysRaw, $legalRegular);
$legalOTStmt = '';
$legalOTBeyondStmt = '';
if (!empty($regHolidays)) {
    $legalOTStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldLocation` = 1 AND `fldDate` IN ('" . implode("','", $regHolidays) . "') THEN LEAST(`fldDuration`,480) ELSE 0 END) AS legal_ot";
    $legalOTBeyondStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldLocation` = 1 AND `fldDate` IN ('" . implode("','", $regHolidays) . "') AND `fldDuration` > 480 THEN `fldDuration` - 480 ELSE 0 END) AS legal_otbeyond";
}
$specialHolidays = array_diff($specialHolidaysRaw, $legalSpecial);
$specialOTStmt = '';
$specialOTBeyondStmt = '';
if (!empty($specialHolidays)) {
    $specialOTStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldLocation` = 1 AND `fldDate` IN ('" . implode("','", $specialHolidays) . "') THEN LEAST(`fldDuration`,480) ELSE 0 END) AS spc_ot";
    $specialOTBeyondStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldLocation` = 1 AND `fldDate` IN ('" . implode("','", $specialHolidays) . "') AND `fldDuration` > 480 THEN `fldDuration` - 480 ELSE 0 END) AS spc_otbeyond";
}
$weekends = array_diff($weekendsRaw, $legalRegular, $legalSpecial);
$restdayOTStmt = '';
$restdayOTBeyondStmt = '';
if (!empty($weekends)) {
    $restdayOTStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldLocation` = 1 AND `fldDate` IN ('" . implode("','", $weekends) . "') THEN LEAST(`fldDuration`,480) ELSE 0 END) AS rd_ot";
    $restdayOTBeyondStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldLocation` = 1 AND `fldDate` IN ('" . implode("','", $weekends) . "') AND `fldDuration` > 480 THEN `fldDuration` - 480 ELSE 0 END) AS rd_otbeyond";
}
$nonWorkingDays = array_values(array_unique(array_merge($weekendsRaw, $regHolidaysRaw, $specialHolidaysRaw)));
$regOTStmt = '';
if (!empty($nonWorkingDays)) {
    $regOTStmt = ", SUM(CASE WHEN `fldMHType` = 1 AND `fldLocation` = 1 AND `fldDate` NOT IN ('" . implode("','", $nonWorkingDays) . "') THEN `fldDuration` ELSE 0 END) AS reg_ot";
}
$totalWorkingDays = getDaysInMonths($yearMonth) - count($nonWorkingDays);

$report_data = array();
//employee query here
// $allEmpQ = "SELECT `fldEmployeeNum`,CONCAT(`fldSurname`,', ',`fldFirstname`)  AS ename FROM emp_prof WHERE fldNick<>'' AND (fldResignDate IS NULL OR fldResignDate>:selYearMonth) ORDER BY fldEmployeeNum";
// $elStmt = $connkdt->prepare($allEmpQ);
// $elStmt->execute([":selYearMonth" => $selYearMonth]);
// if ($elStmt->rowCount() > 0) {
//     $elArr = $elStmt->fetchAll();
//     foreach ($elArr as $el) {
//         $enum = $el['fldEmployeeNum'];
//         $ename = $el['ename'];
//         $report_data[$enum]['name'] = $ename;
//     }
// }

#endregion

#region main
$entriesQuery = "SELECT
`fldEmployeeNum`,`fldLocation`,
SUM(
    CASE WHEN `fldMHType` = 0 THEN `fldDuration` ELSE 0
END
) AS totalreg,
SUM(
CASE WHEN `fldMHType` = 1 THEN `fldDuration` ELSE 0
END
) AS totalot,
SUM(
CASE WHEN `fldProject` = :leaveID AND `fldItem` = :vlID THEN `fldDuration`
END
) AS totalvl,
SUM(
CASE WHEN `fldProject` = :leaveID AND `fldItem` = :slID THEN `fldDuration`
END
) AS totalsl,
SUM(
CASE WHEN `fldProject` = :leaveID AND `fldItem` NOT IN (:vlID,:slID) THEN `fldDuration`
END
) AS totalel,
SUM(
CASE WHEN `fldProject` = :leaveID THEN `fldDuration`
END
) AS totallv,
SUM(
CASE WHEN `fldProject` != :leaveID THEN `fldDuration` ELSE 0
END
) AS totalmh $regOTStmt $restdayOTStmt $restdayOTBeyondStmt $legalOTStmt $legalOTBeyondStmt $restdayLegalStmt $restdayLegalBeyondStmt $specialOTStmt $specialOTBeyondStmt $restdaySpcStmt $restdaySpcBeyondStmt
FROM
    `dailyreport`
WHERE
`fldLocation` <> 0
$dateCompare
GROUP BY
    `fldEmployeeNum`,`fldLocation`
";
$entriesStmt = $connwebjmr->prepare($entriesQuery);
$entriesStmt->execute([":leaveID" => $leaveID, ":vlID" => $vlID, ":slID" => $slID]);
if ($entriesStmt->rowCount() > 0) {
    $entriesArr = $entriesStmt->fetchAll();
    foreach ($entriesArr as $ent) {
        $empid = $ent['fldEmployeeNum'];
        $ename = getName($empid);
        $location = (int)$ent['fldLocation'];
        $totalReg = $ent['totalreg'];
        $totalOT = $ent['totalot'];
        $totalVL = $ent['totalvl'];
        $totalSL = $ent['totalsl'];
        $totalEL = $ent['totalel'];
        $totalLeave = $ent['totallv'];
        $totalMH = $ent['totalmh'];

        $totalMH_WFH = 450 * ($totalWorkingDays - getPinasokSaKDT($yearMonth, $empid));
        if (array_key_exists('reg_ot', $ent)) {
            $regularOT = $ent['reg_ot'];
            if ($regularOT) {
                $report_data[$location][$empid]['mh']['regularOT'] = $regularOT / 60;
            }
        }
        if (array_key_exists('rd_ot', $ent)) {
            $rdOT = $ent['rd_ot'];
            if ($rdOT) {
                $report_data[$location][$empid]['mh']['rdOT'] = $rdOT / 60;
            }
        }
        if (array_key_exists('rd_otbeyond', $ent)) {
            $rdOTBeyond = $ent['rd_otbeyond'];
            if ($rdOT) {
                $report_data[$location][$empid]['mh']['rdOTBeyond'] = $rdOTBeyond / 60;
            }
        }
        if (array_key_exists('legal_ot', $ent)) {
            $legalOT = $ent['legal_ot'];
            if ($legalOT) {
                $report_data[$location][$empid]['mh']['legalOT'] = $legalOT / 60;
            }
        }
        if (array_key_exists('legal_otbeyond', $ent)) {
            $legalOTBeyond = $ent['legal_otbeyond'];
            if ($legalOTBeyond) {
                $report_data[$location][$empid]['mh']['legalOTBeyond'] = $legalOTBeyond / 60;
            }
        }
        if (array_key_exists('rd_legal', $ent)) {
            $rdLegal = $ent['rd_legal'];
            if ($rdLegal) {
                $report_data[$location][$empid]['mh']['rdLegal'] = $rdLegal / 60;
            }
        }
        if (array_key_exists('rd_legalbeyond', $ent)) {
            $rdLegalBeyond = $ent['rd_legalbeyond'];
            if ($rdLegalBeyond) {
                $report_data[$location][$empid]['mh']['rdLegalBeyond'] = $rdLegalBeyond / 60;
            }
        }
        if (array_key_exists('spc_ot', $ent)) {
            $spcOT = $ent['spc_ot'];
            if ($spcOT) {
                $report_data[$location][$empid]['mh']['spcOT'] = $spcOT / 60;
            }
        }
        if (array_key_exists('spc_otbeyond', $ent)) {
            $spcOTBeyond = $ent['spc_otbeyond'];
            if ($spcOTBeyond) {
                $report_data[$location][$empid]['mh']['spcOTBeyond'] = $spcOTBeyond / 60;
            }
        }
        if (array_key_exists('rd_spc', $ent)) {
            $rdSpc = $ent['rd_spc'];
            if ($rdSpc) {
                $report_data[$location][$empid]['mh']['rdSpc'] = $rdSpc / 60;
            }
        }
        if (array_key_exists('rd_spcbeyond', $ent)) {
            $rdSpcBeyond = $ent['rd_spcbeyond'];
            if ($rdSpcBeyond) {
                $report_data[$location][$empid]['mh']['rdSpcBeyond'] = $rdSpcBeyond / 60;
            }
        }



        if ($totalReg) {
            if ($location == 2 && $totalReg > $totalMH_WFH) {
                $report_data[$location][$empid]['mh']['totalReg'] = $totalMH_WFH / 60;
            } else {
                $report_data[$location][$empid]['mh']['totalReg'] = $totalReg / 60;
            }
        }

        if ($totalOT) {
            $report_data[$location][$empid]['mh']['totalOT'] = $totalOT / 60;
        } else {
            if ($location == 2 && $cutOff == 0  && $totalReg > $totalMH_WFH) {
                $report_data[$location][$empid]['mh']['totalOT'] = ($totalReg - $totalMH_WFH) / 60;
            }
        }

        if ($totalLeave) {
            $report_data[$location][$empid]['mh']['totalLeave'] = $totalLeave / 60;
        } else {
            if ($location == 2 && $cutOff == 0 && $totalReg < $totalMH_WFH) {
                $report_data[$location][$empid]['mh']['totalLeave'] = ($totalMH_WFH - $totalReg) / 60;
            }
        }
        if ($totalVL) {
            $report_data[$location][$empid]['mh']['totalvl'] = $totalVL / 60;
        } else {
            if ($location == 2 && $cutOff == 0 && $totalReg < $totalMH_WFH) {
                $report_data[$location][$empid]['mh']['totalvl'] = ($totalMH_WFH - $totalReg) / 60;
            }
        }
        if ($totalSL) {
            $report_data[$location][$empid]['mh']['totalsl'] = $totalSL / 60;
        } else {
            if ($location == 2 && $cutOff == 0 && $totalReg < $totalMH_WFH) {
                $report_data[$location][$empid]['mh']['totalsl'] = 0;
            }
        }
        if ($totalEL) {
            $report_data[$location][$empid]['mh']['totalel'] = $totalEL / 60;
        } else {
            if ($location == 2 && $cutOff == 0 && $totalReg < $totalMH_WFH) {
                $report_data[$location][$empid]['mh']['totalel'] = 0;
            }
        }
        if ($totalMH) {
            $report_data[$location][$empid]['mh']['totalMH'] = $totalMH / 60;
        }
        if (array_key_exists($empid, $report_data[$location])) {
            if (!array_key_exists('name', $report_data[$location][$empid])) {
                $report_data[$location][$empid]['name'] = $ename;
            }
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
function getDaysInMonths($yearmonth)
{
    $numberOfDays = 0;
    list($year, $month) = explode("-", $yearmonth);
    $numberOfDays = cal_days_in_month(CAL_GREGORIAN, $month, $year);
    return $numberOfDays;
}
function getPinasokSaKDT($yearmonth, $empid)
{
    global $connwebjmr;
    $count = 0;
    $countQ = "SELECT COUNT(DISTINCT(fldDate)) FROM dailyreport WHERE fldDate LIKE :yearmonth AND fldEmployeeNum = :empid AND fldLocation = 1";
    $countStmt = $connwebjmr->prepare($countQ);
    $countStmt->execute([":yearmonth" => "$yearmonth%", ":empid" => $empid]);
    $count = $countStmt->fetchColumn();
    return $count;
}
#endregion