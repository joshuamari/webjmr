<?php

require_once __DIR__ . '/bootstrap.php';

try {
    $requestedBy = (int) getCurrentEmployeeId();

    $employeeNum = (int) requestValue('employeeNumber', 'Employee Number is required');
    $unlockDate = trim((string) requestValue('unlockDate', 'Unlock date is required'));
    $dateRequested = date('Y-m-d H:i:s');

    if ($employeeNum <= 0) {
        jsonError('Invalid employee number.', 422);
    }

    if (!preg_match('/^\d{4}-\d{2}$/', $unlockDate)) {
        jsonError('Invalid unlock date format. Expected YYYY-MM.', 422);
    }

    $checkQuery = "
        SELECT COUNT(*)
        FROM `unlock_request` ur
        WHERE ur.`employee_number` = :employeeNum
          AND ur.`unlock_date` = :unlockDate
          AND COALESCE(
                (
                    SELECT ua.`action`
                    FROM `unlock_actions` ua
                    WHERE ua.`unlock_id` = ur.`unlock_id`
                    ORDER BY ua.`action_at` DESC, ua.`action_id` DESC
                    LIMIT 1
                ),
                1
              ) = 1
    ";

    $checkStmt = $connwebjmr->prepare($checkQuery);
    $checkStmt->execute([
        ':employeeNum' => $employeeNum,
        ':unlockDate' => $unlockDate,
    ]);

    $blockingCount = (int) $checkStmt->fetchColumn();

    if ($blockingCount > 0) {
        jsonError('A pending or accepted request already exists for this employee and month.', 409);
    }

    $insertQuery = "
        INSERT INTO `unlock_request` (
            `employee_number`,
            `unlock_date`,
            `date_requested`,
            `requested_by`
        ) VALUES (
            :employeeNum,
            :unlockDate,
            :dateRequested,
            :requestedBy
        )
    ";

    $insertStmt = $connwebjmr->prepare($insertQuery);
    $success = $insertStmt->execute([
        ':employeeNum' => $employeeNum,
        ':unlockDate' => $unlockDate,
        ':dateRequested' => $dateRequested,
        ':requestedBy' => $requestedBy,
    ]);

    if (!$success) {
        jsonError('Failed to add entry.', 500);
    }

    $recipients = getUnlockRequestEmailRecipients($requestedBy, $employeeNum);

    $emailData = buildUnlockRequestEmail([
        'employeeNumber' => $employeeNum,
        'unlockDate' => $unlockDate,
        'requestedBy' => $requestedBy,
        'dateRequested' => $dateRequested,
    ]);

    $mailSent = sendUnlockRequestNotification(
        $recipients['to'],
        $recipients['cc'],
        $emailData['subject'],
        $emailData['htmlBody']
    );

    if (!$mailSent) {
        error_log(
            "Unlock request saved but email failed. " .
            "employee={$employeeNum}, unlockDate={$unlockDate}, " .
            "to=" . implode(',', $recipients['to']) . ", " .
            "cc=" . implode(',', $recipients['cc'])
        );
    }

    jsonSuccess([
        'employeeNumber' => $employeeNum,
        'unlockDate' => $unlockDate,
        'emailSent' => $mailSent,
    ], 'Request submitted successfully.');
} catch (Throwable $e) {
    error_log('request_unlock.php error: ' . $e->getMessage());
    jsonError('Failed to request unlock.', 500);
}