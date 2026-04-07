<?php

function getUnlockRequestsSubmittedBy(string $employeeId): array
{
    global $connwebjmr;

    $sql = "
        SELECT
            ur.unlock_id,
            ur.employee_number,
            ur.requested_by,
            ur.requested_month,
            ur.request_reason,
            ur.date_requested,
            ur.status,
            ur.action_by,
            ur.action_at,
            ur.action_reason,
            ur.expiration_date
        FROM unlock_requests ur
        WHERE ur.requested_by = :employeeId
        ORDER BY ur.date_requested DESC, ur.unlock_id DESC
    ";

    $stmt = $connwebjmr->prepare($sql);
    $stmt->execute([
        ':employeeId' => $employeeId,
    ]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
}

function getUnlockRequestsForEmployee(string $employeeId): array
{
    global $connwebjmr;

    $sql = "
        SELECT
            ur.unlock_id,
            ur.employee_number,
            ur.requested_by,
            ur.requested_month,
            ur.request_reason,
            ur.date_requested,
            ur.status,
            ur.action_by,
            ur.action_at,
            ur.action_reason,
            ur.expiration_date
        FROM unlock_requests ur
        WHERE ur.employee_number = :employeeId
        ORDER BY ur.date_requested DESC, ur.unlock_id DESC
    ";

    $stmt = $connwebjmr->prepare($sql);
    $stmt->execute([
        ':employeeId' => $employeeId,
    ]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
}

function getEffectiveUnlockRequestStatus(array $row, ?int $nowTs = null): string
{
    $nowTs = $nowTs ?? time();
    $status = strtolower(trim((string)($row['status'] ?? 'pending')));

    if ($status === 'pending') {
        return 'pending';
    }

    if ($status === 'denied') {
        return 'denied';
    }

    if ($status === 'approved') {
        $expirationDate = $row['expiration_date'] ?? null;

        if (empty($expirationDate)) {
            return 'approved';
        }

        $expirationTs = strtotime($expirationDate);
        if ($expirationTs === false) {
            return 'approved';
        }

        if ($expirationTs <= $nowTs) {
            return 'expired';
        }

        $today = date('Y-m-d', $nowTs);
        $expirationDay = date('Y-m-d', $expirationTs);

        if ($expirationDay === $today) {
            return 'expiring_today';
        }

        return 'approved';
    }

    return $status !== '' ? $status : 'pending';
}

function mapUnlockRequestRow(array $row, array $employeeNameMap = []): array
{
    $targetEmployeeId = (string)($row['employee_number'] ?? '');
    $requestedById = (string)($row['requested_by'] ?? '');
    $actionById = (string)($row['action_by'] ?? '');

    $effectiveStatus = getEffectiveUnlockRequestStatus($row);

    return [
        'requestId' => (string)($row['unlock_id'] ?? ''),
        'targetEmployeeId' => $targetEmployeeId,
        'targetEmployeeName' => $employeeNameMap[$targetEmployeeId] ?? $targetEmployeeId,
        'requestedById' => $requestedById,
        'requestedByName' => $employeeNameMap[$requestedById] ?? $requestedById,
        'requestedOn' => formatDateTimeDisplay($row['date_requested'] ?? null),
        'requestedMonth' => (string)($row['requested_month'] ?? ''),
        'requestedMonthLabel' => formatRequestedMonthLabel($row['requested_month'] ?? ''),
        'requestReason' => (string)($row['request_reason'] ?? ''),
        'status' => $effectiveStatus,
        'rawStatus' => strtolower(trim((string)($row['status'] ?? 'pending'))),
        'actionTakenById' => $actionById,
        'actionTakenBy' => $actionById !== '' ? ($employeeNameMap[$actionById] ?? $actionById) : '',
        'actionTakenOn' => formatDateTimeDisplay($row['action_at'] ?? null),
        'actionReason' => (string)($row['action_reason'] ?? ''),
        'validUntil' => formatDateTimeDisplay($row['expiration_date'] ?? null),
        'validUntilRaw' => (string)($row['expiration_date'] ?? ''),
        'statusLabel' => formatUnlockRequestStatusLabel($effectiveStatus),
    ];
}

function formatUnlockRequestStatusLabel(string $status): string
{
    return match ($status) {
        'approved' => 'Approved',
        'expiring_today' => 'Expiring Today',
        'expired' => 'Expired',
        'pending' => 'Pending',
        'denied' => 'Denied',
        default => ucwords(str_replace('_', ' ', $status)),
    };
}
function findExistingUnlockRequestForMonth(string $employeeNumber, string $requestedMonth): ?array
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
        WHERE employee_number = :employeeNumber
          AND requested_month = :requestedMonth
        ORDER BY unlock_id DESC
        LIMIT 1
    ";

    $stmt = $connwebjmr->prepare($sql);
    $stmt->execute([
        ':employeeNumber' => $employeeNumber,
        ':requestedMonth' => $requestedMonth,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function canCreateUnlockRequest(string $employeeNumber, string $requestedMonth): bool
{
    $existing = findExistingUnlockRequestForMonth($employeeNumber, $requestedMonth);

    if (!$existing) {
        return true;
    }

    $effectiveStatus = getEffectiveUnlockRequestStatus($existing);
    $blockedStatuses = ['pending', 'approved', 'expiring_today'];

    return !in_array($effectiveStatus, $blockedStatuses, true);
}

function createUnlockRequest(string $employeeNumber, string $requestedBy, string $requestedMonth, string $requestReason): string
{
    global $connwebjmr;

    $sql = "
        INSERT INTO unlock_requests (
            employee_number,
            requested_by,
            requested_month,
            request_reason,
            date_requested,
            status,
            action_by,
            action_at,
            expiration_date
        ) VALUES (
            :employeeNumber,
            :requestedBy,
            :requestedMonth,
            :requestReason,
            NOW(),
            'pending',
            NULL,
            NULL,
            NULL
        )
    ";

    $stmt = $connwebjmr->prepare($sql);
    $stmt->execute([
        ':employeeNumber' => $employeeNumber,
        ':requestedBy' => $requestedBy,
        ':requestedMonth' => $requestedMonth,
        ':requestReason' => $requestReason,
    ]);

    return (string)$connwebjmr->lastInsertId();
}

function getUnlockRequestById(string $unlockId): ?array
{
    global $connwebjmr;

    $sql = "
        SELECT
            unlock_id,
            employee_number,
            requested_by,
            requested_month,
            request_reason,
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