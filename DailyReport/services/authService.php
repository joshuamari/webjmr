<?php

function getEmployeeIdByUserHash($userHash) {
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