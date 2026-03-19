<?php

require_once __DIR__ . '/bootstrap.php';

$projID = (int) requestValue('projID', 0);
$itemID = (int) requestValue('itemID', 0);
$empGroupId = (int) requestValue('empGroup', 0);
$empNum = trim((string) requestValue('empNum', ''));
$searchJrd = trim((string) requestValue('searchjrd', ''));

if ($projID <= 0) {
    jsonError('Project ID is required.', 400);
}

if ($itemID <= 0) {
    jsonSuccess([]);
}

try {
    $systemIds = getSystemIds($connwebjmr);
    $trainProjID = (int) ($systemIds['trainProjID'] ?? 0);
    $empGroupAbbr = $empGroupId > 0 ? getGroupAbbreviation($connnew, $empGroupId) : '';
    $sharedProjectIds = getSharedProjectIds($connwebjmr, $empNum);

    $params = [
        ':projID' => $projID,
        ':empGroup' => $empGroupAbbr,
        ':searchJrd' => '%' . $searchJrd . '%',
    ];

    $conditions = [
        "fldProject = :projID",
        "fldActive = 1",
        "fldDelete = 0",
        "fldJob LIKE :searchJrd",
    ];

    if ($projID === $trainProjID) {
        $conditions[] = "fldItem IS NULL";
    } else {
        $conditions[] = "fldItem = :itemID";
        $params[':itemID'] = $itemID;
    }

    $groupConditions = [
        "fldGroup = :empGroup",
        "fldGroup IS NULL",
    ];

    if (!empty($sharedProjectIds)) {
        $sharedPlaceholders = [];

        foreach ($sharedProjectIds as $index => $sharedProjectId) {
            $placeholder = ":sharedProject{$index}";
            $sharedPlaceholders[] = $placeholder;
            $params[$placeholder] = $sharedProjectId;
        }

        $groupConditions[] = "fldProject IN (" . implode(', ', $sharedPlaceholders) . ")";
    }

    $conditions[] = '(' . implode(' OR ', $groupConditions) . ')';

    $query = "
        SELECT
            fldID AS jobID,
            fldJob AS jobName
        FROM drawingreference
        WHERE " . implode(' AND ', $conditions) . "
        ORDER BY fldPriority
    ";

    $stmt = $connwebjmr->prepare($query);
    $stmt->execute($params);

    $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonSuccess($jobs);
} catch (Throwable $e) {
    jsonError('Failed to load jobs.', 500);
}