<?php
require_once __DIR__ . '/bootstrap.php';

try {
    $requestedBy = getCurrentEmployeeId();
    $employeeNumber = trim((string)requireRequestValue('employee_number', 'Employee is required.'));
    $requestedMonth = trim((string)requireRequestValue('requested_month', 'Requested month is required.'));

    if (!preg_match('/^\d+$/', $employeeNumber)) {
        jsonError('Invalid employee number.', 400);
    }

    if (!preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $requestedMonth)) {
        jsonError('Invalid requested month format.', 400);
    }

    $currentMonth = date('Y-m');
    if ($requestedMonth >= $currentMonth) {
        jsonError('Requested month must be before the current month.', 400);
    }

    $hasOverride = hasOverridePermission($requestedBy);
    $formData = buildRequestFormData($requestedBy, $hasOverride);

    $allowedEmployees = [];
    foreach (($formData['employeesByGroup'] ?? []) as $groupEmployees) {
        foreach ($groupEmployees as $employee) {
            $value = (string)($employee['value'] ?? '');
            if ($value !== '') {
                $allowedEmployees[] = $value;
            }
        }
    }

    $allowedEmployees = array_values(array_unique($allowedEmployees));

    if (!in_array($employeeNumber, $allowedEmployees, true)) {
        jsonError('You are not allowed to request access for this employee.', 403);
    }

    if (!canCreateUnlockRequest($employeeNumber, $requestedMonth)) {
        jsonError('A request already exists for this employee and month.', 409);
    }

    $newId = createUnlockRequest($employeeNumber, $requestedBy, $requestedMonth);
    $createdRow = getUnlockRequestById($newId);

    if (!$createdRow) {
        jsonError('Request was created but could not be retrieved.', 500);
    }

    $employeeIds = [
        (string)($createdRow['employee_number'] ?? ''),
        (string)($createdRow['requested_by'] ?? ''),
        (string)($createdRow['action_by'] ?? ''),
    ];

    $employeeNameMap = buildEmployeeNameMap($employeeIds);
    $request = mapUnlockRequestRow($createdRow, $employeeNameMap);

    $emailSent = false;

    try {
        $approverEmployeeIds = getEmployeesWithUnlockPermission();

        $toEmailMap = getEmployeeEmailsByIds($approverEmployeeIds);
        $ccEmailMap = getEmployeeEmailsByIds([
            (string)($createdRow['employee_number'] ?? ''),
            (string)($createdRow['requested_by'] ?? ''),
        ]);

        $nameMap = getEmployeeNamesByIds([
            (string)($createdRow['employee_number'] ?? ''),
            (string)($createdRow['requested_by'] ?? ''),
        ]);

        $emailSent = sendUnlockRequestSubmittedEmail(
            $createdRow,
            $toEmailMap,
            $ccEmailMap,
            $nameMap
        );
    } catch (Throwable $mailError) {
        error_log('request_unlock.php mail error: ' . $mailError->getMessage());
        $emailSent = false;
    }

    jsonSuccess([
        'request' => $request,
        'emailSent' => $emailSent,
    ], 'Temporary access request submitted.');
} catch (Throwable $e) {
    error_log('request_unlock.php error: ' . $e->getMessage());
    jsonError('Server error in request unlock endpoint.', 500);
}