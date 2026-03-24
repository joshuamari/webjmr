<?php

const PERMISSION_UNLOCK = 53;
const PERMISSION_PLANNING = 5;

function hasUnlockPermission($empNum): bool
{
    return hasPermission($empNum, PERMISSION_UNLOCK);
}

function hasPlanningPermission($empNum): bool
{
    return hasPermission($empNum, PERMISSION_PLANNING);
}

function hasPermission($empNum, int $permissionId): bool
{
    global $connkdt;

    $stmt = $connkdt->prepare("
        SELECT COUNT(*)
        FROM user_permissions
        WHERE permission_id = :permissionID
          AND fldEmployeeNum = :empID
    ");

    $stmt->execute([
        ':empID' => $empNum,
        ':permissionID' => $permissionId
    ]);

    return (int) $stmt->fetchColumn() > 0;
}