<?php
require_once __DIR__ . '/bootstrap.php';

try {
    $employeeId = getCurrentEmployeeId();
    $employee = getEmployeeProfile($employeeId);

    if (empty($employee)) {
        jsonError('Employee profile not found.', 404, [
            'empNum' => $employeeId
        ]);
    }

    jsonSuccess([
        'empNum' => $employeeId,
        'empFName' => $employee['fldFirstname'] ?? '',
        'empSName' => $employee['fldSurname'] ?? '',
        'empNName' => $employee['fldNick'] ?? '',
        'empGroup' => $employee['fldGroup'] ?? '',
        'empGender' => $employee['fldGender'] ?? '',
        'empPos' => $employee['fldDesig'] ?? '',
        'hasPlanning' => hasPlanningPermission($employeeId),
        'hasUnlock' => hasUnlockPermission($employeeId),
        'hasOverride' => hasOverridePermission($employeeId),
    ]);
} catch (Throwable $e) {
    error_log('check_login.php error: ' . $e->getMessage());
    jsonError('Server error in check_login endpoint.'. $e->getMessage(), 500);
}