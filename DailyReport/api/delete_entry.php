<?php

require_once __DIR__ . '/bootstrap.php';

$trID = (int) requireRequestValue('trID', 'Entry ID is required.');

if ($trID <= 0) {
    jsonError('Valid entry ID is required.', 400);
}

$actorNum = getCurrentEmployeeId();
$overrideReason = trim((string) requestValue('overrideReason', ''));

ensureDailyReportHistoryTable();

$oldRow = fetchDailyReportRowById($trID);

if (!$oldRow) {
    jsonError('Entry not found or already deleted.', 404);
}

assertDailyReportDateEditable($actorNum, (string) ($oldRow['fldDate'] ?? ''));

try {
    $connwebjmr->beginTransaction();

    $stmt = $connwebjmr->prepare("
        DELETE FROM dailyreport
        WHERE fldID = :trID
    ");
    $stmt->execute([
        ':trID' => $trID,
    ]);

    if ($stmt->rowCount() === 0) {
        $connwebjmr->rollBack();
        jsonError('Entry not found or already deleted.', 404);
    }

    recordDailyReportDeletedHistory($trID, $oldRow, $actorNum, $overrideReason);

    $connwebjmr->commit();

    jsonSuccess([
        'deletedId' => $trID,
    ], 'Entry deleted successfully.');
} catch (Throwable $e) {
    if ($connwebjmr->inTransaction()) {
        $connwebjmr->rollBack();
    }

    jsonError('Failed to delete entry.', 500);
}
