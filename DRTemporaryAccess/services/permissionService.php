<?php

const PERMISSION_UNLOCK = 53;
const PERMISSION_OVERRIDE = 50;
const PERMISSION_PLANNING = 5;

function hasUnlockPermission($empNum): bool
{
    return hasPermission($empNum, PERMISSION_UNLOCK);
}

function hasPlanningPermission($empNum): bool
{
    return hasPermission($empNum, PERMISSION_PLANNING);
}
function hasOverridePermission($empNum): bool
{
    return hasPermission($empNum, PERMISSION_OVERRIDE);
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

function getEmployeesWithUnlockPermission(): array
{
    global $connkdt;

    $stmt = $connkdt->prepare("
        SELECT DISTINCT up.fldEmployeeNum
        FROM user_permissions up
        INNER JOIN emp_prof el
            ON el.fldEmployeeNum = up.fldEmployeeNum
        WHERE up.permission_id = :permissionID
          AND (
                el.fldResignDate IS NULL
                OR el.fldResignDate = '0000-00-00'
                OR el.fldResignDate >= CURDATE()
          )
    ");

    $stmt->execute([
        ':permissionID' => PERMISSION_UNLOCK,
    ]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    return array_values(array_filter(array_map(
        fn($row) => (string)($row['fldEmployeeNum'] ?? ''),
        $rows
    )));
}