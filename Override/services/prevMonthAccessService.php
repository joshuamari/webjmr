<?php

function getPastMonthAccessInfo($userId, $selectedYearMonth) {
    if (isSystemUser($userId) || isManager($userId)) {
        return [
            'canAccessAllMonths' => true,
            'canEditSelectedMonth' => true,
            'requestedMonth' => null,
        ];
    }

    if (!isPreviousMonthLockedBySchedule()) {
        return [
            'canAccessAllMonths' => false,
            'canEditSelectedMonth' => true,
            'requestedMonth' => $selectedYearMonth,
        ];
    }

    $approvedRequest = getLatestApprovedPastMonthAccessRequest($userId, $selectedYearMonth);

    if (!$approvedRequest) {
        return [
            'canAccessAllMonths' => false,
            'canEditSelectedMonth' => false,
            'requestedMonth' => null,
        ];
    }

    $isValid = isApprovalStillValid($approvedRequest['expiration_date'] ?? null);

    return [
        'canAccessAllMonths' => false,
        'canEditSelectedMonth' => $isValid,
        'requestedMonth' => $isValid ? (string)($approvedRequest['requested_month'] ?? null) : null,
    ];
}

function canAccessPreviousMonth($userId, $selectedYearMonth) {
    $info = getPastMonthAccessInfo($userId, $selectedYearMonth);
    return !empty($info['canEditSelectedMonth']);
}

function isSystemUser($userId) {
    global $connnew;

    $sysId = 16;
    $excludedUserId = 510;

    $query = "
        SELECT EXISTS(
            SELECT 1
            FROM employee_list
            WHERE group_id = :sysId
              AND id = :userId
              AND id <> :excluded
        )
    ";

    $stmt = $connnew->prepare($query);
    $stmt->execute([
        ':sysId' => $sysId,
        ':userId' => $userId,
        ':excluded' => $excludedUserId
    ]);

    return (bool)$stmt->fetchColumn();
}

function isManager($userId) {
    global $connkdt;

    $query = "
        SELECT EXISTS(
            SELECT 1
            FROM user_permissions
            WHERE fldEmployeeNum = :userId
              AND permission_id = 53
        )
    ";

    $stmt = $connkdt->prepare($query);
    $stmt->execute([
        ':userId' => $userId
    ]);

    return (bool)$stmt->fetchColumn();
}

function isPreviousMonthLockedBySchedule() {
    $lockTime = '13:00:00';

    $firstWorkingDay = getFirstWorkingDayOfMonth();

    if ($firstWorkingDay === null) {
        return false;
    }

    $now = new DateTime();
    $lockDateTime = new DateTime($firstWorkingDay . ' ' . $lockTime);

    return $now >= $lockDateTime;
}

function getFirstWorkingDayOfMonth() {
    global $connkdt;

    $yearMonth = date('Y-m');
    $startDate = $yearMonth . '-01';
    $date = new DateTime($startDate);

    $query = "
        SELECT fldHolidayType
        FROM kdtholiday
        WHERE fldDate = :date
        LIMIT 1
    ";

    $stmt = $connkdt->prepare($query);

    while ($date->format('Y-m') === $yearMonth) {
        $currentDate = $date->format('Y-m-d');

        $stmt->execute([
            ':date' => $currentDate
        ]);

        $holidayType = $stmt->fetchColumn();
        $dayOfWeek = (int)$date->format('N');
        $isWorkingDay = false;

        if ($holidayType !== false) {
            $holidayType = (int)$holidayType;

            if ($holidayType === 2) {
                $isWorkingDay = true;
            } elseif ($holidayType === 0 || $holidayType === 1) {
                $isWorkingDay = false;
            }
        } else {
            $isWorkingDay = ($dayOfWeek >= 1 && $dayOfWeek <= 5);
        }

        if ($isWorkingDay) {
            return $currentDate;
        }

        $date->modify('+1 day');
    }

    return null;
}

function hasValidPrevMonthAccessApproval($userId, $selectedYearMonth) {
    $approvedRequest = getLatestApprovedPastMonthAccessRequest($userId, $selectedYearMonth);

    if (!$approvedRequest) {
        return false;
    }

    return isApprovalStillValid($approvedRequest['expiration_date'] ?? null);
}

function getLatestApprovedPastMonthAccessRequest($userId, $selectedYearMonth) {
    global $connwebjmr;

    $query = "
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
        WHERE employee_number = :userId
          AND requested_month = :requestedMonth
          AND status = :status
        ORDER BY action_at DESC, unlock_id DESC
        LIMIT 1
    ";

    $stmt = $connwebjmr->prepare($query);
    $stmt->execute([
        ':userId' => $userId,
        ':requestedMonth' => $selectedYearMonth,
        ':status' => 'approved',
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function isApprovalStillValid($expirationDate) {
    if (empty($expirationDate)) {
        return false;
    }

    $now = new DateTime();
    $expiryDateTime = new DateTime($expirationDate);

    return $now < $expiryDateTime;
}