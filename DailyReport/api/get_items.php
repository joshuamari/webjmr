<?php

require_once __DIR__ . '/bootstrap.php';

$projID = (int) requireRequestValue('projID', 'Project ID is required.');
$empGroupId = (int) requestValue('empGroup', 0);
$empPos = trim((string) requestValue('empPos', ''));
$empNum = trim((string) requestValue('empNum', ''));
$searchIOW = trim((string) requestValue('searchIOW', ''));

try {
    $systemIds = getSystemIds($connwebjmr);
    $sharedProjectIds = getSharedProjectIds($connwebjmr, $empNum);
    $empGroupAbbr = $empGroupId > 0 ? getGroupAbbreviation($connnew, $empGroupId) : '';

    $params = [
        ':projID' => $projID,
        ':empGroup' => $empGroupAbbr,
        ':searchIOW' => '%' . $searchIOW . '%',
    ];

    $conditions = [
        "fldProject = :projID",
        "fldActive = 1",
        "fldDelete = 0",
        "fldItem LIKE :searchIOW",
    ];

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

    if ($projID === (int) $systemIds['mngID']) {
        $restrictedItemId = getManagementItemRestriction(
            $empPos,
            $empGroupAbbr,
            $KDTW_ACCESS
        );

        if ($restrictedItemId !== null) {
            $conditions[] = "fldID = :restrictedItemId";
            $params[':restrictedItemId'] = $restrictedItemId;
        }
    }

    $query = "
        SELECT
            fldID AS itemID,
            fldItem AS itemName
        FROM itemofworkstable
        WHERE " . implode(' AND ', $conditions) . "
        ORDER BY fldPriority
    ";

    $stmt = $connwebjmr->prepare($query);
    $stmt->execute($params);

    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonSuccess($items);
} catch (Throwable $e) {
    jsonError('Failed to load items.', 500);
}