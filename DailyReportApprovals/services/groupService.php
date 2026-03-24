<?php

function getAllGroups(): array
{
    global $connnew;

    $sql = "
        SELECT
            id,
            abbreviation,
            name
        FROM group_list
        ORDER BY abbreviation ASC
    ";

    $stmt = $connnew->prepare($sql);
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    return array_map(function ($row) {
        return [
            'id' => (string) ($row['id'] ?? ''),
            'value' => strtolower(trim((string) ($row['abbreviation'] ?? ''))),
            'label' => strtoupper(trim((string) ($row['abbreviation'] ?? ''))),
            'name' => trim((string) ($row['name'] ?? '')),
        ];
    }, $rows);
}

function getGroupMapByAbbreviation(): array
{
    $groups = getAllGroups();
    $map = [];

    foreach ($groups as $group) {
        $value = strtolower(trim((string) ($group['value'] ?? '')));
        if ($value === '') {
            continue;
        }

        $map[$value] = [
            'label' => $group['label'] ?? '',
            'name' => $group['name'] ?? '',
        ];
    }

    return $map;
}