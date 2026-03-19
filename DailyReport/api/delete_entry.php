<?php

require_once __DIR__ . '/bootstrap.php';

$trID = (int) requireRequestValue('trID', 'Entry ID is required.');

if ($trID <= 0) {
    jsonError('Valid entry ID is required.', 400);
}

try {
    $stmt = $connwebjmr->prepare("
        DELETE FROM dailyreport
        WHERE fldID = :trID
    ");
    $stmt->execute([
        ':trID' => $trID,
    ]);

    if ($stmt->rowCount() === 0) {
        jsonError('Entry not found or already deleted.', 404);
    }

    jsonSuccess([
        'deletedId' => $trID,
    ], 'Entry deleted successfully.');
} catch (Throwable $e) {
    jsonError('Failed to delete entry.', 500);
}