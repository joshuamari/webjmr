<?php

function getUnlockRequestDashboardData(string $viewerEmpNum): array
{
    $rows = getVisibleUnlockRequests($viewerEmpNum);

    $employeeNumbers = collectUnlockRequestEmployeeNumbers($rows);
    $employeeProfiles = getEmployeeProfilesByEmployeeNumbers($employeeNumbers);

    $pendingRequests = [];
    $actionedRequests = [];

    $summary = [
        'pendingCount' => 0,
        'approvedToday' => 0,
        'deniedToday' => 0,
        'expiringToday' => 0,
    ];

    $today = date('Y-m-d');

    foreach ($rows as $row) {
        $effectiveStatus = getEffectiveUnlockStatus($row);

        $employeeProfile = $employeeProfiles[(string)($row['employee_number'] ?? '')] ?? [];
        $requesterProfile = $employeeProfiles[(string)($row['requested_by'] ?? '')] ?? [];
        $approverProfile = $employeeProfiles[(string)($row['action_by'] ?? '')] ?? [];

        $request = [
            'requestId' => (string) ($row['unlock_id'] ?? ''),
            'employeeName' => buildEmployeeFullName($employeeProfile),
            'employeeId' => (string) ($row['employee_number'] ?? ''),
            'group' => normalizeGroupValue($employeeProfile['fldGroup'] ?? ''),
            'requestedOn' => formatDateTimeDisplay($row['date_requested'] ?? null),
            'requestedMonthLabel' => formatRequestedMonthLabel((string)($row['requested_month'] ?? '')),
            'requestedMonthValue' => (string) ($row['requested_month'] ?? ''),
            'status' => $effectiveStatus,
            'requestedBy' => (string) ($row['requested_by'] ?? ''),
            'requestedByName' => buildEmployeeFullName($requesterProfile),
            'actionTakenOn' => formatDateTimeDisplay($row['action_at'] ?? null),
            'actionTakenBy' => buildEmployeeFullName($approverProfile),
            'expiringOn' => formatDateTimeDisplay($row['expiration_date'] ?? null),
        ];

        if ($effectiveStatus === 'pending') {
            $pendingRequests[] = $request;
            $summary['pendingCount']++;
            continue;
        }

        $actionedRequests[] = $request;

        if ($effectiveStatus === 'approved' && isSameDay($row['action_at'] ?? null, $today)) {
            $summary['approvedToday']++;
        }

        if ($effectiveStatus === 'denied' && isSameDay($row['action_at'] ?? null, $today)) {
            $summary['deniedToday']++;
        }

        if (
            $effectiveStatus === 'approved' &&
            !empty($row['expiration_date']) &&
            isSameDay($row['expiration_date'], $today)
        ) {
            $summary['expiringToday']++;
        }
    }

    return [
        'summary' => $summary,
        'pendingRequests' => $pendingRequests,
        'actionedRequests' => $actionedRequests,
    ];
}

function getVisibleUnlockRequests(string $viewerEmpNum): array
{
    global $connwebjmr;

    // Current rule: users with access to this page can see ALL requests.
    $sql = "
        SELECT
            ur.unlock_id,
            ur.employee_number,
            ur.requested_by,
            ur.requested_month,
            ur.date_requested,
            ur.status,
            ur.action_by,
            ur.action_at,
            ur.expiration_date
        FROM unlock_requests ur
        ORDER BY
            CASE
                WHEN ur.status = 'pending' THEN 0
                ELSE 1
            END,
            ur.date_requested DESC
    ";

    $stmt = $connwebjmr->prepare($sql);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
}

function collectUnlockRequestEmployeeNumbers(array $rows): array
{
    $numbers = [];

    foreach ($rows as $row) {
        $employeeNumber = trim((string)($row['employee_number'] ?? ''));
        $requestedBy = trim((string)($row['requested_by'] ?? ''));
        $actionBy = trim((string)($row['action_by'] ?? ''));

        if ($employeeNumber !== '') {
            $numbers[$employeeNumber] = true;
        }

        if ($requestedBy !== '') {
            $numbers[$requestedBy] = true;
        }

        if ($actionBy !== '') {
            $numbers[$actionBy] = true;
        }
    }

    return array_keys($numbers);
}

function getEmployeeProfilesByEmployeeNumbers(array $employeeNumbers): array
{
    global $connkdt;

    if (empty($employeeNumbers)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($employeeNumbers), '?'));

    $sql = "
        SELECT
            fldEmployeeNum,
            fldFirstname,
            fldSurname,
            fldGroup
        FROM emp_prof
        WHERE fldEmployeeNum IN ($placeholders)
    ";

    $stmt = $connkdt->prepare($sql);
    $stmt->execute($employeeNumbers);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $profilesByEmpNum = [];

    foreach ($rows as $row) {
        $profilesByEmpNum[(string)$row['fldEmployeeNum']] = $row;
    }

    return $profilesByEmpNum;
}

function buildEmployeeFullName(array $profile): string
{
    $fullName = trim(
        ((string)($profile['fldFirstname'] ?? '')) . ' ' .
        ((string)($profile['fldSurname'] ?? ''))
    );

    return $fullName !== '' ? $fullName : '—';
}

function getEffectiveUnlockStatus(array $row): string
{
    $status = (string) ($row['status'] ?? 'pending');
    $expirationDate = $row['expiration_date'] ?? null;

    if (
        $status === 'approved' &&
        !empty($expirationDate) &&
        strtotime($expirationDate) < time()
    ) {
        return 'expired';
    }

    return $status;
}

function formatRequestedMonthLabel(string $requestedMonth): string
{
    if (!$requestedMonth || strlen($requestedMonth) !== 7) {
        return '—';
    }

    $date = DateTime::createFromFormat('Y-m', $requestedMonth);
    if (!$date) {
        return '—';
    }

    return $date->format('F Y');
}

function formatDateTimeDisplay(?string $value): string
{
    if (empty($value)) {
        return '—';
    }

    $ts = strtotime($value);
    if (!$ts) {
        return '—';
    }

    return date('Y-m-d h:i A', $ts);
}

function isSameDay(?string $dateTime, string $targetYmd): bool
{
    if (empty($dateTime)) {
        return false;
    }

    $ts = strtotime($dateTime);
    if (!$ts) {
        return false;
    }

    return date('Y-m-d', $ts) === $targetYmd;
}

function normalizeGroupValue(string $group): string
{
    $group = strtolower(trim($group));
    return $group;
}
function approveUnlockRequest(int $unlockId, string $actionBy): bool
{
    global $connwebjmr;

    $stmt = $connwebjmr->prepare("
        UPDATE unlock_requests
        SET
            status = 'approved',
            action_by = :actionBy,
            action_at = NOW(),
            expiration_date = DATE_ADD(NOW(), INTERVAL 1 DAY)
        WHERE unlock_id = :unlockId
          AND status = 'pending'
    ");

    $stmt->execute([
        ':unlockId' => $unlockId,
        ':actionBy' => $actionBy,
    ]);

    return $stmt->rowCount() > 0;
}
function denyUnlockRequest(int $unlockId, string $actionBy): bool
{
    global $connwebjmr;

    $stmt = $connwebjmr->prepare("
        UPDATE unlock_requests
        SET
            status = 'denied',
            action_by = :actionBy,
            action_at = NOW(),
            expiration_date = DATE_ADD(NOW(), INTERVAL 1 DAY)
        WHERE unlock_id = :unlockId
          AND status = 'pending'
    ");

    $stmt->execute([
        ':unlockId' => $unlockId,
        ':actionBy' => $actionBy,
    ]);

    return $stmt->rowCount() > 0;
}
function getUnlockRequestById(int $unlockId): ?array
{
    global $connwebjmr;

    $sql = "
        SELECT
            unlock_id,
            employee_number,
            requested_by,
            requested_month,
            date_requested,
            status,
            action_by,
            action_at,
            expiration_date
        FROM unlock_requests
        WHERE unlock_id = :unlockId
        LIMIT 1
    ";

    $stmt = $connwebjmr->prepare($sql);
    $stmt->execute([
        ':unlockId' => $unlockId,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}