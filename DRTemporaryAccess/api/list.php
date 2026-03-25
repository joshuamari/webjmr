<?php
require_once __DIR__ . '/bootstrap.php';

try {
    $employeeId = getCurrentEmployeeId();

    $submittedRows = getUnlockRequestsSubmittedBy($employeeId);
    $forMeRows = getUnlockRequestsForEmployee($employeeId);

    $allEmployeeIds = [];

    foreach ([$submittedRows, $forMeRows] as $group) {
        foreach ($group as $row) {
            $employeeNumber = (string)($row['employee_number'] ?? '');
            $requestedBy = (string)($row['requested_by'] ?? '');
            $actionBy = (string)($row['action_by'] ?? '');

            if ($employeeNumber !== '') {
                $allEmployeeIds[] = $employeeNumber;
            }

            if ($requestedBy !== '') {
                $allEmployeeIds[] = $requestedBy;
            }

            if ($actionBy !== '') {
                $allEmployeeIds[] = $actionBy;
            }
        }
    }

    $employeeNameMap = buildEmployeeNameMap($allEmployeeIds);

    $submitted = array_map(function ($row) use ($employeeNameMap) {
        return mapUnlockRequestRow($row, $employeeNameMap);
    }, $submittedRows);

    $forMe = array_map(function ($row) use ($employeeNameMap) {
        return mapUnlockRequestRow($row, $employeeNameMap);
    }, $forMeRows);

    jsonSuccess([
        'submitted' => $submitted,
        'forMe' => $forMe,
    ]);
} catch (Throwable $e) {
    error_log('list.php error: ' . $e->getMessage());
    jsonError('Server error in request list endpoint.', 500);
}