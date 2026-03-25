<?php

function getEmployeeMainGroupId(string $employeeId): ?string
{
    global $connnew;

    $sql = "
        SELECT group_id
        FROM employee_list
        WHERE id = :employeeId
        LIMIT 1
    ";

    $stmt = $connnew->prepare($sql);
    $stmt->execute([
        ':employeeId' => $employeeId,
    ]);

    $groupId = $stmt->fetchColumn();

    return $groupId !== false && $groupId !== null ? (string)$groupId : null;
}

function getGroupAbbreviationMapByIds(array $groupIds): array
{
    global $connnew;

    $groupIds = array_values(array_unique(array_filter(array_map('strval', $groupIds))));
    if (empty($groupIds)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($groupIds), '?'));

    $sql = "
        SELECT
            id,
            abbreviation
        FROM group_list
        WHERE id IN ($placeholders)
    ";

    $stmt = $connnew->prepare($sql);
    $stmt->execute($groupIds);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $map = [];

    foreach ($rows as $row) {
        $groupId = (string)($row['id'] ?? '');
        $abbr = trim((string)($row['abbreviation'] ?? ''));

        if ($groupId !== '') {
            $map[$groupId] = $abbr !== '' ? $abbr : $groupId;
        }
    }

    return $map;
}

function getLeaderAccessibleGroupIds(string $employeeId): array
{
    global $connnew;

    $sql = "
        SELECT group_id
        FROM employee_group
        WHERE employee_number = :employeeId
        ORDER BY group_id ASC
    ";

    $stmt = $connnew->prepare($sql);
    $stmt->execute([
        ':employeeId' => $employeeId,
    ]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $groupIds = [];
    foreach ($rows as $row) {
        $groupId = (string)($row['group_id'] ?? '');
        if ($groupId !== '') {
            $groupIds[] = $groupId;
        }
    }

    return array_values(array_unique($groupIds));
}

function getEmployeesByGroupIds(array $groupIds): array
{
    global $connnew;

    $groupIds = array_values(array_unique(array_filter(array_map('strval', $groupIds))));
    if (empty($groupIds)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($groupIds), '?'));

    $sql = "
        SELECT
            id,
            group_id,
            firstname,
            surname,
            resignation_date
        FROM employee_list
        WHERE group_id IN ($placeholders)
          AND (
                resignation_date IS NULL
                OR resignation_date = '0000-00-00'
                OR resignation_date >= CURDATE()
              )
        ORDER BY id ASC
    ";

    $stmt = $connnew->prepare($sql);
    $stmt->execute($groupIds);

    return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
}

function formatEmployeeListName(array $row): string
{
    $firstName = trim((string)($row['firstname'] ?? ''));
    $surname = trim((string)($row['surname'] ?? ''));

    return trim($firstName . ' ' . $surname);
}

function buildRequestFormData(string $employeeId, bool $hasOverride): array
{
    $ownGroupId = getEmployeeMainGroupId($employeeId);

    if ($ownGroupId === null || $ownGroupId === '') {
        throw new RuntimeException('Unable to determine employee group.');
    }

    $allowedGroupIds = [];

    if ($hasOverride) {
        $allowedGroupIds = getLeaderAccessibleGroupIds($employeeId);

        // ensure own group is still available even if mapping table forgot it
        if (!in_array($ownGroupId, $allowedGroupIds, true)) {
            $allowedGroupIds[] = $ownGroupId;
        }
    } else {
        $allowedGroupIds = [$ownGroupId];
    }

    $allowedGroupIds = array_values(array_unique($allowedGroupIds));

    $groupLabelMap = getGroupAbbreviationMapByIds($allowedGroupIds);

    $groups = [];
    foreach ($allowedGroupIds as $groupId) {
        $groups[] = [
            'value' => (string)$groupId,
            'label' => $groupLabelMap[$groupId] ?? (string)$groupId,
        ];
    }

    $employeesByGroup = [];

    if ($hasOverride) {
        $employeeRows = getEmployeesByGroupIds($allowedGroupIds);

        foreach ($employeeRows as $row) {
            $groupId = (string)($row['group_id'] ?? '');
            $empId = (string)($row['id'] ?? '');

            if ($groupId === '' || $empId === '') {
                continue;
            }

            if (!isset($employeesByGroup[$groupId])) {
                $employeesByGroup[$groupId] = [];
            }

            $employeesByGroup[$groupId][] = [
                'value' => $empId,
                'label' => formatEmployeeListName($row) ?: $empId,
            ];
        }
    } else {
        $profile = getEmployeeProfile($employeeId);
        $employeesByGroup[$ownGroupId] = [[
            'value' => $employeeId,
            'label' => trim(($profile['fldFirstname'] ?? '') . ' ' . ($profile['fldSurname'] ?? '')) ?: $employeeId,
        ]];
    }



    $defaultEmployeeId = $employeeId;

    return [
        'defaultGroup' => (string)$ownGroupId,
        'defaultEmployeeId' => (string)$defaultEmployeeId,
        'groups' => $groups,
        'employeesByGroup' => $employeesByGroup,
    ];
}