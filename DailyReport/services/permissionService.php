<?php
function checkAccess($empNum) {
    global $connkdt;

    $permissionID = 50;

    $stmt = $connkdt->prepare("
        SELECT COUNT(*)
        FROM user_permissions
        WHERE permission_id = :permissionID
          AND fldEmployeeNum = :empID
    ");

    $stmt->execute([
        ':empID' => $empNum,
        ':permissionID' => $permissionID
    ]);

    return (int)$stmt->fetchColumn() > 0;
}