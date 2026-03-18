<?php

require_once __DIR__ . '/bootstrap.php';

$selDate = trim((string) requestValue('selDate', date('Y-m-d')));
$selLoc = trim((string) requestValue('selLoc', 'KDT'));

try {
    $isWorkday = true;

    if ((int) date('N', strtotime($selDate)) >= 6) {
        $isWorkday = false;
    }

    $stmt = $connkdt->prepare("
        SELECT fldHolidayType
        FROM kdtholiday
        WHERE fldDate = :selDate
          AND fldLocation = :selLoc
        LIMIT 1
    ");
    $stmt->execute([
        ':selDate' => $selDate,
        ':selLoc' => $selLoc,
    ]);

    $holidayType = $stmt->fetchColumn();

    if ($holidayType !== false) {
        $isWorkday = ((string) $holidayType === '2');
    }

    jsonSuccess([
        'isWorkday' => $isWorkday,
        'date' => $selDate,
        'location' => $selLoc,
    ]);
} catch (Throwable $e) {
    jsonError('Failed to check work day.', 500);
}