<?php

require_once __DIR__ . '/bootstrap.php';

function isWorkDayForLocation(PDO $conn, string $date, string $location = 'KDT'): bool
{
    $isWorkday = true;

    if ((int) date('N', strtotime($date)) >= 6) {
        $isWorkday = false;
    }

    $stmt = $conn->prepare("
        SELECT fldHolidayType
        FROM kdtholiday
        WHERE fldDate = :selDate
          AND fldLocation = :location
        LIMIT 1
    ");
    $stmt->execute([
        ':selDate' => $date,
        ':location' => $location,
    ]);

    $holidayType = $stmt->fetchColumn();

    if ($holidayType !== false) {
        $isWorkday = ((string) $holidayType === '2');
    }

    return $isWorkday;
}

$curMonth = trim((string) requireRequestValue('curMonth', 'Current month is required.'));
$empNum = trim((string) requestValue('empNum', '464'));

$dateOrigin = '2023-04-03';
$today = date('Y-m-d');
$currentMonthFirstDay = date('Y-m-01');
$location = 'KDT';

try {
    $monthStart = $curMonth;
    if ((int) date('N', strtotime($curMonth)) !== 7) {
        $monthStart = date('Y-m-d', strtotime($curMonth . ' -1 Sunday'));
    }

    $monthEnd = date('Y-m-t', strtotime($curMonth));
    if ((int) date('N', strtotime($monthEnd)) !== 6) {
        $monthEnd = date('Y-m-d', strtotime($monthEnd . ' +1 Saturday'));
    }

    $effectiveEndDate = $monthEnd;
    if ($curMonth >= $currentMonthFirstDay) {
        $effectiveEndDate = $today;
    }

    $holidayStmt = $connkdt->prepare("
        SELECT fldDate, fldHoliday
        FROM kdtholiday
        WHERE fldLocation = :location
          AND fldHolidayType != 2
          AND fldDate >= :startDate
          AND fldDate <= :endDate
    ");
    $holidayStmt->execute([
        ':location' => $location,
        ':startDate' => $monthStart,
        ':endDate' => $monthEnd,
    ]);

    $monthHolidays = [];
    foreach ($holidayStmt->fetchAll(PDO::FETCH_ASSOC) as $holiday) {
        $monthHolidays[] = $holiday['fldDate'] . '||' . $holiday['fldHoliday'];
    }

    $entryStmt = $connwebjmr->prepare("
        SELECT fldDate, SUM(fldDuration) AS totalDuration
        FROM dailyreport
        WHERE fldDate >= :startDate
          AND fldDate <= :endDate
          AND fldEmployeeNum = :empNum
        GROUP BY fldDate
    ");
    $entryStmt->execute([
        ':startDate' => $monthStart,
        ':endDate' => $monthEnd,
        ':empNum' => $empNum,
    ]);

    $greenDates = [];
    foreach ($entryStmt->fetchAll(PDO::FETCH_ASSOC) as $entry) {
        $entryDate = $entry['fldDate'];
        $greenMinutes = (int) $entry['totalDuration'];

        $isWorkday = isWorkDayForLocation($connkdt, $entryDate, $location);

        if (($isWorkday && $greenMinutes >= 480) || (!$isWorkday && $greenMinutes >= 240)) {
            $greenDates[] = $entryDate;
        }
    }

    $redDates = [];
    $scanDate = $monthStart;

    while ($scanDate <= $effectiveEndDate) {
        if (
            isWorkDayForLocation($connkdt, $scanDate, $location) &&
            $scanDate >= $dateOrigin &&
            !in_array($scanDate, $greenDates, true)
        ) {
            $redDates[] = $scanDate;
        }

        $scanDate = date('Y-m-d', strtotime($scanDate . ' +1 day'));
    }

    jsonSuccess([
        'greenDates' => $greenDates,
        'redDates' => $redDates,
        'monthHolidays' => $monthHolidays,
    ]);
} catch (Throwable $e) {
    jsonError('Failed to load data colors.', 500);
}