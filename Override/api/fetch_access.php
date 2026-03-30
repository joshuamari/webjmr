<?php
require_once __DIR__ . '/bootstrap.php';

header('Content-Type: application/json');

try {
    $employeeId = getCurrentEmployeeId();

    echo json_encode([
        'success'=>true,
        'hasUnlock' => hasUnlockPermission($employeeId),
        'hasPlanning' => hasPlanningPermission($employeeId)
    ]);
} catch (Throwable $e) {
    error_log('fetch_access.php error: ' . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error in session endpoint.'. $e->getMessage()
    ]);
}