<?php

function getEmployeeIdByUserHash($userHash)
{
    global $connkdt;

    $stmt = $connkdt->prepare("
        SELECT fldEmployeeNum
        FROM kdtlogin
        WHERE fldUserHash = ?
        LIMIT 1
    ");

    $stmt->execute([$userHash]);

    $employeeId = $stmt->fetchColumn();

    return $employeeId ?: null;
}

function getCurrentEmployeeId(): string
{
    $userHash = $_COOKIE['userID'] ?? '';

    if ($userHash === '') {
        jsonError('Unauthorized.', 401);
    }

    $employeeId = getEmployeeIdByUserHash($userHash);

    if (!$employeeId) {
        jsonError('Unauthorized.', 401);
    }

    return (string) $employeeId;
}