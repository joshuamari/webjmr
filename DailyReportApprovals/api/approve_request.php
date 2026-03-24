<?php
require_once __DIR__ . '/bootstrap.php';

try {
    $employeeId = getCurrentEmployeeId();

    if (!hasUnlockPermission($employeeId)) {
        jsonError('Unauthorized.', 403);
    }

    $unlockId = (int) requireRequestValue('unlockId', 'Unlock request ID is required.');

    if ($unlockId <= 0) {
        jsonError('Invalid unlock request ID.', 400);
    }

    $updated = approveUnlockRequest($unlockId, $employeeId);

    if (!$updated) {
        jsonError('Request was already processed or not found.', 409);
    }

    jsonSuccess(null, 'Request approved.');
} catch (Throwable $e) {
    error_log('approve_request.php error: ' . $e->getMessage());
    jsonError('Failed to approve request.', 500);
}