<?php
function buildUnlockRequestEmailRecipients(string $requestedBy, string $employeeNumber): array
{
    $toEmployeeIds = getEmployeesWithUnlockPermission();

    $ccEmployeeIds = [$employeeNumber];

    if ($requestedBy !== $employeeNumber) {
        $ccEmployeeIds[] = $requestedBy;
    }

    $toEmployeeIds = array_values(array_unique(array_filter(array_map('strval', $toEmployeeIds))));
    $ccEmployeeIds = array_values(array_unique(array_filter(array_map('strval', $ccEmployeeIds))));

    $toEmailMap = getEmployeeEmailsByIds($toEmployeeIds);
    $ccEmailMap = getEmployeeEmailsByIds($ccEmployeeIds);

    $toEmails = array_values(array_unique(array_filter(array_map('trim', array_values($toEmailMap)))));
    $ccEmails = array_values(array_unique(array_filter(array_map('trim', array_values($ccEmailMap)))));

    return [
        'to' => $toEmails,
        'cc' => $ccEmails,
    ];
}
function buildUnlockRequestEmailSubject(array $request): string
{
    $monthLabel = formatRequestedMonthLabel((string)($request['requested_month'] ?? ''));

    return $monthLabel !== ''
        ? "DR Temporary Access Request - {$monthLabel}"
        : "DR Temporary Access Request Submitted";
}

function buildUnlockRequestEmailBody(array $request, array $employeeNameMap): string
{
    $employeeNumber = (string)($request['employee_number'] ?? '');
    $requestedBy = (string)($request['requested_by'] ?? '');
    $requestedMonth = (string)($request['requested_month'] ?? '');
    $dateRequested = formatDateTimeDisplay($request['date_requested'] ?? null);

    $employeeRequestedName = $employeeNameMap[$employeeNumber] ?? $employeeNumber;
    $requestedByName = $employeeNameMap[$requestedBy] ?? $requestedBy;

    return
        "A Daily Report temporary access request has been submitted.\n\n" .
        "Employee Requested: {$employeeRequestedName} (EMP-{$employeeNumber})\n" .
        "Requested By: {$requestedByName} (EMP-{$requestedBy})\n" .
        "Requested Month: " . formatRequestedMonthLabel($requestedMonth) . "\n" .
        "Date Requested: {$dateRequested}\n";
}