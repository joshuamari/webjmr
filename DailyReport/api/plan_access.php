<?php

require_once __DIR__ . '/bootstrap.php';

$empNum = trim((string) requireRequestValue('empNum', 'Employee number is required.'));
$permissionId = 5;

try {
    $stmt = $connkdt->prepare("
        SELECT COUNT(*)
        FROM user_permissions
        WHERE fldEmployeeNum = :empNum
          AND permission_id = :permissionId
    ");
    $stmt->execute([
        ':empNum' => $empNum,
        ':permissionId' => $permissionId,
    ]);

    $hasAccess = ((int) $stmt->fetchColumn()) > 0;

    jsonSuccess([
        'hasAccess' => $hasAccess,
    ]);
} catch (Throwable $e) {
    jsonError('Failed to check planning access.', 500);
}