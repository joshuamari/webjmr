<?php

require_once __DIR__ . '/bootstrap.php';

$grpNum = (int) requireRequestValue('grpNum', 'Group number is required.');
$empNum = trim((string) requireRequestValue('empNum', 'Employee number is required.'));
$projID = (int) requestValue('projID', 0);

function getProjectGroup(PDO $conn, int $projID): string
{
    $stmt = $conn->prepare("
        SELECT fldGroup
        FROM projectstable
        WHERE fldID = :projID
        LIMIT 1
    ");
    $stmt->execute([
        ':projID' => $projID,
    ]);

    $value = $stmt->fetchColumn();

    return $value !== false ? (string)$value : '';
}

function getSharedEmployeeIds(PDO $conn, int $projID): array
{
    if ($projID <= 0) {
        return [];
    }

    $stmt = $conn->prepare("
        SELECT fldEmployeeNum
        FROM project_share
        WHERE fldProject = :projID
    ");
    $stmt->execute([
        ':projID' => $projID,
    ]);

    return $stmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
}

try {
    $systemIds = getSystemIds($connwebjmr);
    $defaultProjectIds = $systemIds['defaults'] ?? [];

    $groupAbbr = getGroupAbbreviation($connnew, $grpNum);

    if ($projID > 0 && !in_array($projID, $defaultProjectIds, true)) {
        $projectGroup = getProjectGroup($connwebjmr, $projID);
        if ($projectGroup !== '') {
            $groupAbbr = $projectGroup;
        }
    }

    $params = [
        ':empNum' => $empNum,
        ':empGrp' => $groupAbbr,
    ];

    $groupConditions = [
        "fldGroup = :empGrp",
    ];

    $sharedEmployeeIds = getSharedEmployeeIds($connwebjmr, $projID);

    if (!empty($sharedEmployeeIds)) {
        $sharedPlaceholders = [];

        foreach ($sharedEmployeeIds as $index => $sharedEmpNum) {
            $placeholder = ":sharedEmp{$index}";
            $sharedPlaceholders[] = $placeholder;
            $params[$placeholder] = $sharedEmpNum;
        }

        $groupConditions[] = "fldEmployeeNum IN (" . implode(', ', $sharedPlaceholders) . ")";
    }

    $query = "
        SELECT
            fldEmployeeNum AS id,
            CONCAT(fldFirstName, ' ', fldSurname) AS name
        FROM emp_prof
        WHERE fldEmployeeNum != :empNum
          AND (" . implode(' OR ', $groupConditions) . ")
          AND fldActive = 1
          AND fldNick != ''
        ORDER BY fldFirstName ASC, fldSurname ASC
    ";

    $stmt = $connkdt->prepare($query);
    $stmt->execute($params);

    $checkers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonSuccess($checkers);
} catch (Throwable $e) {
    jsonError('Failed to load checkers.' . $e, 500);
}