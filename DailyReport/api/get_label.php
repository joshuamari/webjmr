<?php

require_once __DIR__ . '/bootstrap.php';

$itemID = (int) requireRequestValue('itemID', 'Item ID is required.');

if ($itemID <= 0) {
    jsonError('Valid item ID is required.', 400);
}

try {
    $stmt = $connwebjmr->prepare("
        SELECT fldLabel
        FROM itemlabels
        WHERE fldItem = :itemID
        LIMIT 1
    ");
    $stmt->execute([
        ':itemID' => $itemID,
    ]);

    $label = $stmt->fetchColumn();

    jsonSuccess([
        'label' => $label !== false ? (string) $label : '',
    ]);
} catch (Throwable $e) {
    jsonError('Failed to load item label.', 500);
}