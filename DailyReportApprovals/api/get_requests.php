<?php
require_once __DIR__ . '/bootstrap.php';

try {
    $employeeId = getCurrentEmployeeId();

    if (!hasUnlockPermission($employeeId)) {
        jsonError('Unauthorized.', 403);
    }

    $data = getUnlockRequestDashboardData($employeeId);

    jsonSuccess($data);
} catch (Throwable $e) {
    error_log('get_requests.php error: ' . $e->getMessage());
    jsonError('Failed to load unlock requests.' .  $e->getMessage(), 500);
}