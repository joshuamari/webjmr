<?php

function getEmployeeProfile($employeeId): array
{
    global $connkdt;

    $stmt = $connkdt->prepare("
        SELECT *
        FROM emp_prof
        WHERE fldEmployeeNum = ?
        LIMIT 1
    ");

    $stmt->execute([$employeeId]);

    return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
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

function getEmployeeProfilesByIds(array $employeeIds): array
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
                    fldSurname,
                    fldNick
                FROM emp_prof
                WHERE fldEmployeeNum IN ($placeholders)
            ";

    $stmt = $connkdt->prepare($sql);
    $stmt->execute($employeeIds);

    return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
}

function buildEmployeeNameMap(array $employeeIds): array
{
    $profiles = getEmployeeProfilesByIds($employeeIds);
    $map = [];

    foreach ($profiles as $profile) {
        $empId = (string)($profile['fldEmployeeNum'] ?? '');
        if ($empId === '') {
            continue;
        }

        $fullName = trim(implode(' ', array_filter([
            $profile['fldFirstname'] ?? '',
            $profile['fldSurname'] ?? '',
        ])));

        $map[$empId] = $fullName !== '' ? $fullName : $empId;
    }

    return $map;
}

function getEmployeeNamesByIds(array $employeeIds): array
{
    return buildEmployeeNameMap($employeeIds);
}
