<?php

require_once __DIR__ . '/bootstrap.php';

$empNum = trim((string) requireRequestValue('empNum', 'Employee number is required.'));
$targetDate = trim((string) requireRequestValue('getDate', 'Target date is required.'));
$sourceDate = trim((string) requireRequestValue('copyDate', 'Source date is required.'));

$changeLog = date('YmdHis') . '_' . $empNum;

try {
    $connwebjmr->beginTransaction();

    $selectStmt = $connwebjmr->prepare("
        SELECT
            dr.*,
            pt.fldDelete AS projDel
        FROM dailyreport AS dr
        INNER JOIN projectstable AS pt
            ON dr.fldProject = pt.fldID
        WHERE dr.fldEmployeeNum = :empNum
          AND dr.fldDate = :sourceDate
    ");

    $selectStmt->execute([
        ':empNum' => $empNum,
        ':sourceDate' => $sourceDate,
    ]);

    $rows = $selectStmt->fetchAll(PDO::FETCH_ASSOC);

    $insertStmt = $connwebjmr->prepare("
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
            :groupName,
            :groupId,
            :targetDate,
            :location,
            :projectId,
            :itemId,
            :jobId,
            :twoThree,
            :revision,
            :towId,
            :checkerId,
            :duration,
            :mhTypeId,
            :remarks,
            :changeLog,
            :trainingGroupId
        )
    ");

    $copiedCount = 0;

    foreach ($rows as $row) {
        if ((int) $row['projDel'] === 1) {
            continue;
        }

        $insertStmt->execute([
            ':empNum' => $empNum,
            ':groupName' => $row['fldGroup'],
            ':groupId' => $row['fldGroupID'],
            ':targetDate' => $targetDate,
            ':location' => $row['fldLocation'],
            ':projectId' => $row['fldProject'],
            ':itemId' => $row['fldItem'],
            ':jobId' => $row['fldJobRequestDescription'],
            ':twoThree' => $row['fld2D3D'],
            ':revision' => $row['fldRevision'],
            ':towId' => $row['fldTOW'],
            ':checkerId' => $row['fldChecker'],
            ':duration' => $row['fldDuration'],
            ':mhTypeId' => $row['fldMHType'],
            ':remarks' => $row['fldRemarks'],
            ':changeLog' => $changeLog,
            ':trainingGroupId' => $row['fldTrGroup'],
        ]);

        $copiedCount++;
    }

    $connwebjmr->commit();

    jsonSuccess([
        'copiedCount' => $copiedCount,
        'sourceDate' => $sourceDate,
        'targetDate' => $targetDate,
    ], 'Entries copied successfully.');
} catch (Throwable $e) {
    if ($connwebjmr->inTransaction()) {
        $connwebjmr->rollBack();
    }

    jsonError('Failed to copy entries.', 500);
}