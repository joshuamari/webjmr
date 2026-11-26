<?php

function requestValue(string $key, $default = null)
{
    return $_POST[$key] ?? $_GET[$key] ?? $default;
}

function requireRequestValue(string $key, string $message = 'Required field is missing.')
{
    $value = requestValue($key);

    if ($value === null || $value === '') {
        jsonError($message, 400);
    }

    return $value;
}

function resolveHolidayLocation(string $date, string $location): string
{
    $holidayLocation = $location !== '' ? $location : 'KDT';

    // From September 2026, overseas assignments follow the KDT holiday calendar.
    if ($date >= '2026-09-01') {
        return 'KDT';
    }

    return $holidayLocation;
}

function isWorkDayForLocation(PDO $conn, string $date, string $location = 'KDT'): bool
{
    $timestamp = strtotime($date);
    $isWorkday = true;

    if ($timestamp !== false && (int) date('N', $timestamp) >= 6) {
        $isWorkday = false;
    }

    $stmt = $conn->prepare("
        SELECT fldHolidayType
        FROM kdtholiday
        WHERE fldDate = :selDate
          AND fldLocation = :selLoc
        LIMIT 1
    ");
    $stmt->execute([
        ':selDate' => $date,
        ':selLoc' => resolveHolidayLocation($date, $location),
    ]);

    $holidayType = $stmt->fetchColumn();

    if ($holidayType !== false) {
        $isWorkday = ((string) $holidayType === '2');
    }

    return $isWorkday;
}
