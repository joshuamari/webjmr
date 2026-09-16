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

$actorNum = getCurrentEmployeeId();
$overrideReason = trim((string) requestValue('overrideReason', ''));

ensureDailyReportHistoryTable();
assertDailyReportDateEditable($actorNum, $getDate);

$writeRow = buildDailyReportRowFromWrite([
    'empNum' => $empNum,
    'grpAbbrev' => $grpAbbrev,
    'grpID' => $grpNum,
    'drDate' => $getDate,
    'location' => $getLocation,
    'project' => $getProject,
    'item' => $getItem,
    'job' => $jobReqDesc,
    'twoThree' => $twoDthreeD,
    'revision' => $revisions,
    'tow' => $typeOfWork,
    'checker' => $checker,
    'duration' => $getDuration,
    'mhType' => $getMHType,
    'remarks' => $remarks,
    'trGroup' => $trGrp,
]);

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
        $connwebjmr->beginTransaction();
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
            $connwebjmr->rollBack();
            jsonError('Failed to add entry.', 500);
        }

        $entryId = (int) $connwebjmr->lastInsertId();
        recordDailyReportCreatedHistory($entryId, $writeRow, $actorNum, $overrideReason);

        $connwebjmr->commit();

        jsonSuccess([
            'mode' => 'create',
            'entryId' => $entryId,
        ], 'Entry added successfully.');
    }

    $entryId = (int) $addType;

    if ($entryId <= 0) {
        jsonError('Valid entry ID is required for update.', 400);
    }

    $oldRow = fetchDailyReportRowById($entryId);

    if (!$oldRow) {
        jsonError('Entry not found or no changes were made.', 404);
    }

    assertDailyReportDateEditable($actorNum, (string) ($oldRow['fldDate'] ?? ''));

    $connwebjmr->beginTransaction();

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
        $connwebjmr->rollBack();
        jsonError('Entry not found or no changes were made.', 404);
    }

    $didChange = recordDailyReportUpdatedHistory($entryId, $oldRow, $writeRow, $actorNum, $overrideReason);

    if (!$didChange) {
        $connwebjmr->rollBack();
        jsonSuccess([
            'mode' => 'update',
            'entryId' => $entryId,
        ], 'Entry updated successfully.');
    }

    $connwebjmr->commit();

    jsonSuccess([
        'mode' => 'update',
        'entryId' => $entryId,
    ], 'Entry updated successfully.');
} catch (Throwable $e) {
    if ($connwebjmr->inTransaction()) {
        $connwebjmr->rollBack();
    }

    jsonError('Failed to save entry.', 500);
}
