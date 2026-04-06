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

    $dt = DateTime::createFromFormat('Y-m-d', $selectedDate);

    if (!$dt || $dt->format('Y-m-d') !== $selectedDate) {
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

    $selectedYearMonth = $dt->format('Y-m');
    $currentYearMonth = date('Y-m');

    list($selectedYear, $selectedMonth) = array_map('intval', explode('-', $selectedYearMonth));
    list($currentYear, $currentMonth) = array_map('intval', explode('-', $currentYearMonth));

    $selectedIndex = ($selectedYear * 12) + $selectedMonth;
    $currentIndex = ($currentYear * 12) + $currentMonth;

    $isSystemUser = isSystemUser($employeeNumber);
    $isManager = isManager($employeeNumber);

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
        "checks" => [
            "isSystemUser" => $isSystemUser,
            "isManager" => $isManager,
        ],
        "branch" => null,
    ];

    // Absolute overrides first
    if ($isSystemUser) {
        $canEdit = true;
        $decision = 'system_user_override';
        $debug["branch"] = "system_user_override";

    } elseif ($isManager) {
        $canEdit = true;
        $decision = 'manager_override';
        $debug["branch"] = "manager_override";

    } elseif ($selectedIndex === $currentIndex) {
        $canEdit = true;
        $decision = 'current_month';
        $debug["branch"] = "current_month";

    } elseif ($selectedIndex < $currentIndex) {
        $canEdit = canAccessPreviousMonth($employeeNumber, $selectedYearMonth);
        $decision = $canEdit
            ? 'past_month_allowed'
            : 'past_month_denied';
        $debug["branch"] = "past_month";

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
        "canEdit" => false,
        "error" => $e->getMessage(),
    ]);
}