<?php

require_once __DIR__ . '/bootstrap.php';

header('Content-Type: application/json');

try {
    $selectedDate = $_POST['yearMonth'] ?? null;
    $employeeNumber = $_POST['employeeNumber'] ?? null;

    if (!$selectedDate || !$employeeNumber) {
        echo json_encode([
            "canEdit" => true,
            "message" => "Incomplete parameters",
            "debug" => [
                "selectedDate" => $selectedDate,
                "employeeNumber" => $employeeNumber,
            ],
        ]);
        exit;
    }

    $selectedTimestamp = strtotime($selectedDate);

    if ($selectedTimestamp === false) {
        echo json_encode([
            "canEdit" => true,
            "message" => "Invalid selectedDate format",
            "debug" => [
                "selectedDate" => $selectedDate,
                "employeeNumber" => $employeeNumber,
            ],
        ]);
        exit;
    }

    $selectedYearMonth = date('Y-m', $selectedTimestamp);
    $currentYearMonth = date('Y-m');

    list($selectedYear, $selectedMonth) = array_map('intval', explode('-', $selectedYearMonth));
    list($currentYear, $currentMonth) = array_map('intval', explode('-', $currentYearMonth));

    $selectedIndex = ($selectedYear * 12) + $selectedMonth;
    $currentIndex = ($currentYear * 12) + $currentMonth;

    $canEdit = false;
    $decision = 'default_false';

    $debug = [
        "input" => [
            "selectedDate_raw" => $selectedDate,
            "employeeNumber" => $employeeNumber,
        ],
        "normalized" => [
            "selectedYearMonth" => $selectedYearMonth,
            "currentYearMonth" => $currentYearMonth,
            "selectedIndex" => $selectedIndex,
            "currentIndex" => $currentIndex,
        ],
        "branch" => null,
        "canAccessPreviousMonth" => null,
        "checks" => null,
    ];

    if ($selectedIndex === $currentIndex) {
        $canEdit = true;
        $decision = 'current_month';
        $debug["branch"] = "current_month";

    } elseif ($selectedIndex === $currentIndex - 1) {
        $debug["branch"] = "previous_month";

        $isSystemUser = isSystemUser($employeeNumber);
        $isManager = isManager($employeeNumber);
        $isLockedBySchedule = isPreviousMonthLockedBySchedule();
        $hasValidApproval = hasValidPrevMonthAccessApproval($employeeNumber);

        $debug["checks"] = [
            "isSystemUser" => $isSystemUser,
            "isManager" => $isManager,
            "isPreviousMonthLockedBySchedule" => $isLockedBySchedule,
            "hasValidPrevMonthAccessApproval" => $hasValidApproval,
        ];

        $previousMonthAccess = canAccessPreviousMonth($employeeNumber);
        $debug["canAccessPreviousMonth"] = $previousMonthAccess;

        $canEdit = $previousMonthAccess;
        $decision = 'previous_month_rule';

    } elseif ($selectedIndex < $currentIndex - 1) {
        $canEdit = false;
        $decision = 'older_than_previous_month';
        $debug["branch"] = "older_than_previous_month";

    } else {
        $canEdit = true;
        $decision = 'future_month';
        $debug["branch"] = "future_month";
    }

    echo json_encode([
        "canEdit" => $canEdit,
        "decision" => $decision,
        "debug" => $debug,
    ]);

} catch (Exception $e) {
    echo json_encode([
        "canEdit" => true,
        "error" => $e->getMessage(),
    ]);
}