<?php

require_once __DIR__ . '/bootstrap.php';

$addType = trim((string) requestValue('addType', '0'));
$empNum = trim((string) requireRequestValue('empNum', 'Employee number is required.'));
$grpNum = (int) requireRequestValue('grpNum', 'Group number is required.');
$getDate = trim((string) requireRequestValue('getDate', 'Selected date is required.'));
$getLocation = trim((string) requireRequestValue('getLocation', 'Location is required.'));
$getProject = (int) requireRequestValue('getProject', 'Project ID is required.');
$getItem = (int) requireRequestValue('getItem', 'Item ID is required.');
$getDuration = trim((string) requireRequestValue('getDuration', 'Duration is required.'));

if (!isset($_POST['getMHType'])) {
    jsonError('Manhour type is required.', 400);
}

$getMHType = trim((string) $_POST['getMHType']);

$jobReqDesc = requestValue('getDescription', null);
$twoDthreeD = requestValue('getTwoThree', null);
$revisions = (int) requestValue('getRev', 0);
$typeOfWork = requestValue('getType', '');
$checker = requestValue('getChecking', null);
$remarks = requestValue('getRemarks', null);
$trGrp = requestValue('getTrGrp', null);

$grpAbbrev = getGroupAbbreviation($connnew, $grpNum);
$logs = date('YmdHis') . '_' . $empNum;

if ($grpAbbrev === '') {
    jsonError('Invalid group.', 400);
}

function normalizeNullableValue($value)
{
    if ($value === '' || $value === null) {
        return null;
    }

    return $value;
}

$jobReqDesc = normalizeNullableValue($jobReqDesc);
$twoDthreeD = normalizeNullableValue($twoDthreeD);
$typeOfWork = normalizeNullableValue($typeOfWork);
$checker = normalizeNullableValue($checker);
$remarks = normalizeNullableValue($remarks);
$trGrp = normalizeNullableValue($trGrp);

try {
    $params = [
        ':empNum' => $empNum,
        ':grpAbbrev' => $grpAbbrev,
        ':grpID' => $grpNum,
        ':drDate' => $getDate,
        ':getLocation' => $getLocation,
        ':getProject' => $getProject,
        ':getItem' => $getItem,
        ':getDescription' => $jobReqDesc,
        ':getTwoThree' => $twoDthreeD,
        ':getRev' => $revisions,
        ':getType' => $typeOfWork,
        ':getChecking' => $checker,
        ':getDuration' => $getDuration,
        ':getMHType' => $getMHType,
        ':getRemarks' => $remarks,
        ':logs' => $logs,
        ':getTrGrp' => $trGrp,
    ];

    if ($addType === '0') {
        $query = "
            INSERT INTO dailyreport (
                fldEmployeeNum,
                fldGroup,
                fldGroupID,
                fldDate,
                fldLocation,
                fldProject,
                fldItem,
                fldJobRequestDescription,
                fld2D3D,
                fldRevision,
                fldTOW,
                fldChecker,
                fldDuration,
                fldMHType,
                fldRemarks,
                fldChangeLog,
                fldTrGroup
            ) VALUES (
                :empNum,
                :grpAbbrev,
                :grpID,
                :drDate,
                :getLocation,
                :getProject,
                :getItem,
                :getDescription,
                :getTwoThree,
                :getRev,
                :getType,
                :getChecking,
                :getDuration,
                :getMHType,
                :getRemarks,
                :logs,
                :getTrGrp
            )
        ";

        $stmt = $connwebjmr->prepare($query);
        $stmt->execute($params);

        if ($stmt->rowCount() === 0) {
            jsonError('Failed to add entry.', 500);
        }

        jsonSuccess([
            'mode' => 'create',
            'entryId' => (int) $connwebjmr->lastInsertId(),
        ], 'Entry added successfully.');
    }

    $entryId = (int) $addType;

    if ($entryId <= 0) {
        jsonError('Valid entry ID is required for update.', 400);
    }

    $query = "
        UPDATE dailyreport
        SET
            fldEmployeeNum = :empNum,
            fldGroup = :grpAbbrev,
            fldGroupID = :grpID,
            fldDate = :drDate,
            fldLocation = :getLocation,
            fldProject = :getProject,
            fldItem = :getItem,
            fldJobRequestDescription = :getDescription,
            fld2D3D = :getTwoThree,
            fldRevision = :getRev,
            fldTOW = :getType,
            fldChecker = :getChecking,
            fldDuration = :getDuration,
            fldMHType = :getMHType,
            fldRemarks = :getRemarks,
            fldChangeLog = :logs,
            fldTrGroup = :getTrGrp
        WHERE fldID = :entryId
    ";

    $params[':entryId'] = $entryId;

    $stmt = $connwebjmr->prepare($query);
    $stmt->execute($params);

    if ($stmt->rowCount() === 0) {
        jsonError('Entry not found or no changes were made.', 404);
    }

    jsonSuccess([
        'mode' => 'update',
        'entryId' => $entryId,
    ], 'Entry updated successfully.');
} catch (Throwable $e) {
    jsonError('Failed to save entry.', 500);
}