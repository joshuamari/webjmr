<?php

require_once __DIR__ . '/bootstrap.php';

$projID = requireRequestValue('projID', 'Project ID is required.');

try {
    $systemIds = getSystemIds($connwebjmr);
    $leaveID = $systemIds['leaveID'];

    if ($leaveID === 0) {
        jsonError('Leave project configuration is missing.', 500);
    }

    $type = ((int)$projID === $leaveID) ? 0 : 1;

    $stmt = $connwebjmr->prepare("
        SELECT
            fldID AS id,
            fldCode AS code,
            fldTOW AS name
        FROM typesofworktable
        WHERE fldTOWType = :type
          AND fldActive = 1
        ORDER BY fldPrio
    ");

    $stmt->execute([':type' => $type]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonSuccess($rows);
} catch (Throwable $e) {
    jsonError('Failed to load types of work.', 500);
}