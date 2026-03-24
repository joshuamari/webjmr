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
function getEmployeeEmailsByIds(array $employeeIds): array
{
    global $connkdt;

    $employeeIds = array_values(array_unique(array_filter(array_map('strval', $employeeIds))));

    if (empty($employeeIds)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($employeeIds), '?'));

    $sql = "
        SELECT
            fldEmployeeNum,
            fldOutlook
        FROM kdtlogin
        WHERE fldEmployeeNum IN ($placeholders)
    ";

    $stmt = $connkdt->prepare($sql);
    $stmt->execute($employeeIds);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $emailMap = [];

    foreach ($rows as $row) {
        $empNum = (string)($row['fldEmployeeNum'] ?? '');
        $email = trim((string)($row['fldOutlook'] ?? ''));

        if ($empNum !== '') {
            $emailMap[$empNum] = $email;
        }
    }

    return $emailMap;
}
function getEmployeeNamesByIds(array $employeeIds): array
{
    global $connkdt;

    $employeeIds = array_values(array_unique(array_filter(array_map('strval', $employeeIds))));

    if (empty($employeeIds)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($employeeIds), '?'));

    $sql = "
        SELECT
            fldEmployeeNum,
            fldFirstname,
            fldSurname
        FROM emp_prof
        WHERE fldEmployeeNum IN ($placeholders)
    ";

    $stmt = $connkdt->prepare($sql);
    $stmt->execute($employeeIds);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $nameMap = [];

    foreach ($rows as $row) {
        $empNum = (string)($row['fldEmployeeNum'] ?? '');
        $fullName = trim(
            ((string)($row['fldFirstname'] ?? '')) . ' ' .
            ((string)($row['fldSurname'] ?? ''))
        );

        if ($empNum !== '') {
            $nameMap[$empNum] = $fullName !== '' ? $fullName : $empNum;
        }
    }

    return $nameMap;
}
function getEmployeeSurnamesByIds(array $employeeIds): array
{
    global $connkdt;

    $employeeIds = array_values(array_unique(array_filter(array_map('strval', $employeeIds))));

    if (empty($employeeIds)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($employeeIds), '?'));

    $sql = "
        SELECT
            fldEmployeeNum,
            fldSurname
        FROM emp_prof
        WHERE fldEmployeeNum IN ($placeholders)
    ";

    $stmt = $connkdt->prepare($sql);
    $stmt->execute($employeeIds);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $surnameMap = [];

    foreach ($rows as $row) {
        $empNum = (string)($row['fldEmployeeNum'] ?? '');
        $surname = trim((string)($row['fldSurname'] ?? ''));

        if ($empNum !== '') {
            $surnameMap[$empNum] = $surname !== '' ? $surname : $empNum;
        }
    }

    return $surnameMap;
}