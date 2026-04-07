<?php
require_once __DIR__ . '/bootstrap.php';

header('Content-Type: application/json');

try {
    $employeeId = getCurrentEmployeeId();
    $employee = getEmployeeProfile($employeeId);
    $prevMonthAccess = getPreviousMonthAccessInfo($employeeId);

    if (empty($employee)) {
        http_response_code(404);
        echo json_encode([
            'isLoggedIn' => true,
            'error' => 'Employee profile not found.',
            'empNum' => $employeeId
        ]);
        exit;
    }

    echo json_encode([
        'isLoggedIn' => true,
        'empNum' => $employeeId,
        'empFName' => $employee['fldFirstname'] ?? '',
        'empSName' => $employee['fldSurname'] ?? '',
        'empNName' => $employee['fldNick'] ?? '',
        'empDateHired' => $employee['fldDateHired'] ?? '',
        'empGroup' => $employee['fldGroup'] ?? '',
        'empGender' => $employee['fldGender'] ?? '',
        'empPos' => $employee['fldDesig'] ?? '',
        'hasOverride' => hasOverridePermission($employeeId),
        'canAccessPreviousMonth' => $prevMonthAccess['canAccessPreviousMonth'],
        'canAccessAllMonths' => $prevMonthAccess['canAccessAllMonths'],
        'accessibleRequestedMonth' => $prevMonthAccess['requestedMonth'],
        'hasUnlock' => hasUnlockPermission($employeeId),
        'hasPlanning' => hasPlanningPermission($employeeId)
    ]);
} catch (Throwable $e) {
    error_log('session.php error: ' . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'isLoggedIn' => false,
        'error' => 'Server error in session endpoint.' . $e->getMessage()
    ]);
}