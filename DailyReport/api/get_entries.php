<?php

require_once __DIR__ . '/bootstrap.php';

$curDay = trim((string) requestValue('curDay', date('Y-m-d')));
$empNum = trim((string) requireRequestValue('empNum', 'Employee number is required.'));

try {
    $stmt = $connwebjmr->prepare("
        SELECT
            dr.fldID AS entryId,
            dr.fldGroup AS groupName,
            dr.fldDuration AS durationMinutes,
            dr.fldMHType AS mhType,
            dr.fldRemarks AS remarks,
            pt.fldProject AS projectName,
            pt.fldDelete AS projectDeleted,
            it.fldItem AS itemName,
            jt.fldJob AS jobName,
            dl.fldLocation AS locationName,
            tow.fldTOW AS towName
        FROM dailyreport AS dr
        LEFT JOIN projectstable AS pt
            ON dr.fldProject = pt.fldID
        LEFT JOIN itemofworkstable AS it
            ON dr.fldItem = it.fldID
        LEFT JOIN drawingreference AS jt
            ON dr.fldJobRequestDescription = jt.fldID
        LEFT JOIN dispatch_locations AS dl
            ON dr.fldLocation = dl.fldID
        LEFT JOIN typesofworktable AS tow
            ON dr.fldTOW = tow.fldID
        WHERE dr.fldDate = :curDay
          AND dr.fldEmployeeNum = :empNum
        ORDER BY dr.fldID ASC
    ");

    $stmt->execute([
        ':curDay' => $curDay,
        ':empNum' => $empNum,
    ]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $entries = array_map(function ($row) {
        return [
            'entryId' => (int) ($row['entryId'] ?? 0),
            'locationName' => $row['locationName'] ?? '',
            'groupName' => $row['groupName'] ?? '',
            'projectName' => $row['projectName'] ?? '',
            'itemName' => $row['itemName'] ?? '',
            'jobName' => $row['jobName'] ?? '',
            'durationMinutes' => (int) ($row['durationMinutes'] ?? 0),
            'mhType' => (int) ($row['mhType'] ?? 0),
            'remarks' => $row['remarks'] ?? '',
            'projectDeleted' => (int) ($row['projectDeleted'] ?? 0),
            'towName' => !empty($row['towName']) ? $row['towName'] : '-',
        ];
    }, $rows);

    jsonSuccess($entries);
} catch (Throwable $e) {
    jsonError('Failed to load entries.', 500);
}