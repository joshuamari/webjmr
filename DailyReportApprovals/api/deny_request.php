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

    $updated = denyUnlockRequest($unlockId, $employeeId);

    if (!$updated) {
        jsonError('Request was already processed or not found.', 409);
    }

    $request = getUnlockRequestById($unlockId);

    if (!$request) {
        jsonSuccess(null, 'Request denied. Email was not sent because request details could not be loaded.');
    }

    $ids = [
        (string)($request['employee_number'] ?? ''),
        (string)($request['requested_by'] ?? ''),
        (string)($request['action_by'] ?? ''),
    ];

    $emailMap = getEmployeeEmailsByIds($ids);
    $nameMap = getEmployeeNamesByIds($ids);
    $surnameMap = getEmployeeSurnamesByIds($ids);

    $emailSent = sendUnlockRequestDecisionEmail($request, $emailMap, $nameMap, $surnameMap);

    if (!$emailSent) {
        jsonSuccess(null, 'Request denied, but email notification was not sent.');
    }

    jsonSuccess(null, 'Request denied.');
} catch (Throwable $e) {
    error_log('deny_request.php error: ' . $e->getMessage());
    jsonError('Failed to deny request.', 500);
}