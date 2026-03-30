<?php

function fetchSingleId(PDO $conn, string $sql, array $params = []): int
{
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    $value = $stmt->fetchColumn();

    return $value !== false ? (int)$value : 0;
}

function fetchIntList(PDO $conn, string $sql, array $params = []): array
{
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);

    return array_map('intval', $rows ?: []);
}

function getProjectIdByName(PDO $conn, string $projectName): int
{
    return fetchSingleId(
        $conn,
        "SELECT fldID FROM projectstable WHERE fldProject = :project LIMIT 1",
        [':project' => $projectName]
    );
}

function getItemIdByName(PDO $conn, string $itemName): int
{
    return fetchSingleId(
        $conn,
        "SELECT fldID FROM itemofworkstable WHERE fldItem = :item LIMIT 1",
        [':item' => $itemName]
    );
}

function getSystemIds(PDO $conn): array
{
    static $cache = null;

    if ($cache !== null) {
        return $cache;
    }

    $cache = [
        'leaveID' => getProjectIdByName($conn, 'Leave'),
        'mngID' => getProjectIdByName($conn, 'Management'),
        'otherID' => getProjectIdByName($conn, 'Business Trip & Other'),
        'kiaID' => getProjectIdByName($conn, 'KDT Internal Activities'),
        'trainProjID' => getProjectIdByName($conn, 'Training'),
        'oneBUTrainerID' => getItemIdByName(
            $conn,
            'Trainer for One BU Participants- [100% KHI]'
        ),
        'defaults' => fetchIntList(
            $conn,
            "SELECT fldID FROM projectstable WHERE fldDirect = 0 AND fldDelete = 0"
        ),
    ];

    return $cache;
}

function getGroupAbbreviation(PDO $conn, int $groupId): string
{
    $stmt = $conn->prepare("
        SELECT abbreviation
        FROM group_list
        WHERE id = :groupId
        LIMIT 1
    ");
    $stmt->execute([
        ':groupId' => $groupId,
    ]);

    $value = $stmt->fetchColumn();

    return $value !== false ? (string)$value : '';
}

function getSharedProjectIds(PDO $conn, string $empNum): array
{
    if ($empNum === '') {
        return [];
    }

    $stmt = $conn->prepare("
        SELECT fldProject
        FROM project_share
        WHERE fldEmployeeNum = :empNum
    ");
    $stmt->execute([
        ':empNum' => $empNum,
    ]);

    $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);

    return array_map('intval', $rows ?: []);
}


function getManagementItemRestriction(string $empPos, string $empGroupAbbr, array $kdtwAccess): ?int
{
    switch ($empPos) {
        case 'SM':
            return 1;

        case 'DM':
            return in_array($empGroupAbbr, $kdtwAccess, true) ? 2 : 3;

        case 'AM':
        case 'CTE':
            return 4;

        case 'SSV':
        case 'SSS':
            return 5;

        default:
            return null;
    }
}