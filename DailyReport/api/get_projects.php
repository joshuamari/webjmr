<?php

require_once __DIR__ . '/bootstrap.php';

$empGroupId = (int) requestValue('empGroup', 0);
$empPos = trim((string) requestValue('empPos', ''));
$empNum = trim((string) requestValue('empNum', ''));
$searchProj = trim((string) requestValue('searchProj', ''));


try {
    if ($empGroupId <= 0) {
        jsonSuccess([]);
    }

    $empGroup = getGroupAbbreviation($connnew, $empGroupId);
    $systemIds = getSystemIds($connwebjmr);
    $sharedProjectIds = getSharedProjectIds($connwebjmr, $empNum);

    $params = [
        ':empGroup' => $empGroup,
        ':searchProj' => '%' . $searchProj . '%',
    ];

    $conditions = [
        "fldActive = 1",
        "fldDelete = 0",
        "fldProject LIKE :searchProj",
    ];

    $groupConditions = [
        "fldGroup IS NULL",
        "fldGroup = :empGroup",
    ];

    if (!empty($sharedProjectIds)) {
        $sharedPlaceholders = [];

        foreach ($sharedProjectIds as $index => $sharedProjectId) {
            $placeholder = ":sharedProject{$index}";
            $sharedPlaceholders[] = $placeholder;
            $params[$placeholder] = $sharedProjectId;
        }

        $groupConditions[] = "fldID IN (" . implode(', ', $sharedPlaceholders) . ")";
    }

    $conditions[] = '(' . implode(' OR ', $groupConditions) . ')';

    if (!in_array($empGroup, $KDTW_ACCESS, true)) {
        $conditions[] = "fldID <> :solProjID";
        $params[':solProjID'] = getProjectIdByName($connwebjmr, 'Development, Analysis & IT');
    }

    if (
        !in_array($empPos, $MANAGEMENT_POSITIONS, true) &&
        !in_array($empNum, $DEVS, true)
    ) {
        $conditions[] = "fldID <> :mngProjID";
        $params[':mngProjID'] = (int) ($systemIds['mngID'] ?? 0);
    }

    $query = "
        SELECT
            fldID AS projID,
            fldProject AS projName,
            fldGroup AS projGroup
        FROM projectstable
        WHERE " . implode(' AND ', $conditions) . "
        ORDER BY fldDirect DESC, fldPriority
    ";

    $stmt = $connwebjmr->prepare($query);
    $stmt->execute($params);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $projects = array_map(function ($project) use ($empGroup) {
        $projectGroup = $project['projGroup'] ?? null;
        $groupAppend = '';

        if ($projectGroup !== null && $projectGroup !== '' && $projectGroup !== $empGroup) {
            $groupAppend = '(' . $projectGroup . ')';
        }

        return [
            'projID' => (int) $project['projID'],
            'projName' => $project['projName'] ?? '',
            'groupAppend' => $groupAppend,
        ];
    }, $rows);

    jsonSuccess($projects);
} catch (Throwable $e) {
    jsonError('Failed to load projects.', 500);
}