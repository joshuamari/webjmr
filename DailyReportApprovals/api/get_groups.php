<?php
require_once __DIR__ . '/bootstrap.php';

try {
    $employeeId = getCurrentEmployeeId();

    if (!hasUnlockPermission($employeeId)) {
        jsonError('Unauthorized.', 403);
    }

    $groups = getAllGroups();

    jsonSuccess([
        'groups' => array_map(function ($group) {
            return [
                'value' => $group['value'],
                'label' => $group['label'],
            ];
        }, $groups),
    ]);
} catch (Throwable $e) {
    error_log('get_groups.php error: ' . $e->getMessage());
    jsonError('Failed to load groups.', 500);
}