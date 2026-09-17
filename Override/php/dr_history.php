<?php

/**
 * Write Daily Report history from Override add / edit / copy / delete.
 */

function overrideLoadDailyReportHistory(): void
{
    static $loaded = false;
    if ($loaded) {
        return;
    }
    $loaded = true;

    global $connwebjmr, $connkdt, $connnew;

    if (!($connwebjmr instanceof PDO)) {
        require_once __DIR__ . '/../../dbconn/dbconnectwebjmr.php';
    }
    if (!($connkdt instanceof PDO)) {
        require_once __DIR__ . '/../../dbconn/dbconnectkdtph.php';
    }
    if (!($connnew instanceof PDO)) {
        require_once __DIR__ . '/../../dbconn/dbconnectnew.php';
    }

    if (!function_exists('getEmployeeProfile')) {
        require_once __DIR__ . '/../../DailyReport/services/employeeService.php';
    }
    if (!function_exists('ensureDailyReportHistoryTable')) {
        require_once __DIR__ . '/../../DailyReport/services/auditHistoryService.php';
    }
}

function overrideHistoryActorNum(array $input): string
{
    foreach (['overrideEmpNum', 'overrideEmpID'] as $key) {
        $value = trim((string) ($input[$key] ?? ''));
        if ($value !== '') {
            return $value;
        }
    }

    return '';
}

function overrideRecordCreatedHistory(int $entryId, string $actorNum, string $reason = ''): void
{
    if ($entryId < 1 || $actorNum === '') {
        return;
    }

    try {
        overrideLoadDailyReportHistory();
        $row = fetchDailyReportRowById($entryId);
        if (!$row) {
            return;
        }
        recordDailyReportCreatedHistory($entryId, $row, $actorNum, $reason);
    } catch (Throwable $e) {
        error_log('Override history create: ' . $e->getMessage());
    }
}

function overrideRecordUpdatedHistory(array $oldRow, int $entryId, string $actorNum, string $reason = ''): void
{
    if ($entryId < 1 || $actorNum === '' || $oldRow === []) {
        return;
    }

    try {
        overrideLoadDailyReportHistory();
        $newRow = fetchDailyReportRowById($entryId);
        if (!$newRow) {
            return;
        }
        recordDailyReportUpdatedHistory($entryId, $oldRow, $newRow, $actorNum, $reason);
    } catch (Throwable $e) {
        error_log('Override history update: ' . $e->getMessage());
    }
}

function overrideRecordDeletedHistory(array $oldRow, int $entryId, string $actorNum, string $reason = ''): void
{
    if ($entryId < 1 || $actorNum === '' || $oldRow === []) {
        return;
    }

    try {
        overrideLoadDailyReportHistory();
        recordDailyReportDeletedHistory($entryId, $oldRow, $actorNum, $reason);
    } catch (Throwable $e) {
        error_log('Override history delete: ' . $e->getMessage());
    }
}
