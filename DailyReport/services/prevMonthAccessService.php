<?php

function canAccessPreviousMonth($userId) {
    if (isSystemUser($userId)) {
        return true;
    }

    if (isManager($userId)) {
        return true;
    }

    if (!isPreviousMonthLockedBySchedule()) {
        return true;
    }

    return hasValidPrevMonthAccessApproval($userId);
}

function isSystemUser($userId) {
    global $connnew;

    $sysId = 16;
    $excludedUserId = 498;

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

function hasValidPrevMonthAccessApproval($userId) {
    $approvedRequest = getLatestApprovedPrevMonthAccessRequest($userId);

    if (!$approvedRequest) {
        return false;
    }

    return isApprovalStillValid($approvedRequest['approved_at']);
}

function getLatestApprovedPrevMonthAccessRequest($userId) {
    global $connwebjmr;

    $query = "
        SELECT
            ua.action_id AS id,
            ur.unlock_id AS request_id,
            ua.action_by AS approved_by,
            ua.action_at AS approved_at
        FROM unlock_request ur
        INNER JOIN unlock_actions ua
            ON ua.request_id = ur.unlock_id
        WHERE ur.employee_number = :userId
          AND ua.action = 1
        ORDER BY ua.action_at DESC, ua.action_id DESC
        LIMIT 1
    ";

    $stmt = $connwebjmr->prepare($query);
    $stmt->execute([
        ':userId' => $userId
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function isApprovalStillValid($approvedAt) {
    if (empty($approvedAt)) {
        return false;
    }

    $approvedDateTime = new DateTime($approvedAt);
    $expiryDateTime = clone $approvedDateTime;
    $expiryDateTime->modify('+1 day');

    $now = new DateTime();

    return $now < $expiryDateTime;
}