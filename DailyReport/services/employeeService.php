<?php

function getEmployeeProfile($employeeId) {
    global $connkdt;

    $stmt = $connkdt->prepare("
        SELECT *
        FROM emp_prof
        WHERE fldEmployeeNum = ?
        LIMIT 1
    ");

    $stmt->execute([$employeeId]);

    $employee = $stmt->fetch(PDO::FETCH_ASSOC);

    return $employee ?: [];
}