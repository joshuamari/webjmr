<?php
require_once __DIR__ . '/../../dbconn/dbconnectkdtph.php';
require_once __DIR__ . '/../../dbconn/dbconnectnew.php';
require_once __DIR__ . '/../../dbconn/dbconnectwebjmr.php';

require_once __DIR__ . '/../services/authService.php';
require_once __DIR__ . '/../services/employeeService.php';
require_once __DIR__ . '/../services/prevMonthAccessService.php';
require_once __DIR__ . '/../services/permissionService.php';

header('Content-Type: application/json');

try {
    $userHash = $_COOKIE['userID'] ?? '';

    if ($userHash === '') {
        http_response_code(401);
        echo json_encode([
            'isLoggedIn' => false,
            'error' => 'Missing user session cookie.'
        ]);
        exit;
    }

    $employeeId = getEmployeeIdByUserHash($userHash);

    if (!$employeeId) {
        http_response_code(401);
        echo json_encode([
            'isLoggedIn' => false,
            'error' => 'Invalid or expired session.'
        ]);
        exit;
    }

    $employee = getEmployeeProfile($employeeId);

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
        'hasOverride' => checkAccess($employeeId),
        'canAccessPreviousMonth' => canAccessPreviousMonth($employeeId)
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'isLoggedIn' => false,
        'error' => 'Server error in session endpoint.',
        'message' => $e->getMessage()
    ]);
}