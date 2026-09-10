<?php

require_once __DIR__ . '/bootstrap.php';

try {
    $viewerId = getCurrentEmployeeId();
    $employeeNum = trim((string) requireRequestValue('empNum', 'Employee number is required.'));

    assertCanViewDailyReportHistory($viewerId, $employeeNum);

    $history = getDailyReportHistory([
        'employeeNum' => $employeeNum,
        'dateFrom' => trim((string) requestValue('dateFrom', '')),
        'dateTo' => trim((string) requestValue('dateTo', '')),
        'action' => trim((string) requestValue('action', 'all')),
        'changedBy' => trim((string) requestValue('changedBy', 'all')),
        'override' => trim((string) requestValue('override', 'all')),
        'sort' => trim((string) requestValue('sort', 'newest')),
    ]);

    jsonSuccess($history);
} catch (Throwable $e) {
    error_log('get_history.php error: ' . $e->getMessage());
    jsonError('Failed to load daily report history.', 500);
}
