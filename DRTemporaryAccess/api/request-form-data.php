<?php
require_once __DIR__ . '/bootstrap.php';

try {
    $employeeId = getCurrentEmployeeId();
    $hasOverride = hasOverridePermission($employeeId);

    $data = buildRequestFormData($employeeId, $hasOverride);

    jsonSuccess($data);
} catch (Throwable $e) {
    error_log('request-form-data.php error: ' . $e->getMessage());
    jsonError('Server error in request form data endpoint.', 500);
}