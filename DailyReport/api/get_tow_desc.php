<?php

require_once __DIR__ . '/bootstrap.php';

$towID = requireRequestValue('towID', 'Type of Work ID is required.');

try {
    $query = "
        SELECT fldTOWDesc
        FROM typesofworktable
        WHERE fldID = :towID
        LIMIT 1
    ";

    $stmt = $connwebjmr->prepare($query);
    $stmt->execute([
        ':towID' => $towID,
    ]);

    $description = $stmt->fetchColumn();

    if ($description === false) {
        jsonError('Type of Work description not found.', 404);
    }

    jsonSuccess([
        'description' => $description,
    ]);
} catch (Throwable $e) {
    jsonError('Failed to load Type of Work description.', 500);
}