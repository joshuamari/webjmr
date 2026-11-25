<?php

require_once __DIR__ . '/bootstrap.php';

$selDate = trim((string) requestValue('selDate', date('Y-m-d')));
$selLoc = trim((string) requestValue('selLoc', 'KDT'));
$holidayLocation = resolveHolidayLocation($selDate, $selLoc);

try {
    $isWorkday = isWorkDayForLocation($connkdt, $selDate, $selLoc);

    jsonSuccess([
        'isWorkday' => $isWorkday,
        'date' => $selDate,
        'location' => $holidayLocation,
    ]);
} catch (Throwable $e) {
    jsonError('Failed to check work day.', 500);
}