<?php

require_once __DIR__ . '/bootstrap.php';

try {
    $query = "
        SELECT
            fldID AS id,
            fldLocation AS name
        FROM dispatch_locations
        WHERE fldActive = 1
        ORDER BY fldCode ASC, fldID ASC
    ";

    $stmt = $connwebjmr->query($query);
    $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonSuccess($locations);
} catch (Throwable $e) {
    jsonError('Failed to load dispatch locations.', 500);
}