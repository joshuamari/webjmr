<?php

require_once __DIR__ . '/bootstrap.php';

try {
    $stmt = $connkdt->query("
        SELECT fldBU
        FROM kdtbu
        WHERE fldDepartment <> ''
        ORDER BY fldBU
    ");

    $groups = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $groups[] = [
            'name' => $row['fldBU'],
        ];
    }

    jsonSuccess($groups);
} catch (Throwable $e) {
    jsonError('Failed to load groups.', 500);
}