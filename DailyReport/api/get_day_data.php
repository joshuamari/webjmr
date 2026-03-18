<?php

require_once __DIR__ . '/bootstrap.php';

$getDate = trim((string) requestValue('getDate', date('Y-m-d')));
$empNum = trim((string) requireRequestValue('empNum', 'Employee number is required.'));

try {
    $stmt = $connwebjmr->prepare("
        SELECT
            pt.fldProject AS projectName,
            SUM(dr.fldDuration) AS projectMinutes,
            pt.fldDelete AS projectDeleted
        FROM dailyreport AS dr
        LEFT JOIN projectstable AS pt
            ON dr.fldProject = pt.fldID
        WHERE dr.fldDate = :getDate
          AND dr.fldEmployeeNum = :empNum
        GROUP BY dr.fldProject, pt.fldProject, pt.fldDelete
        ORDER BY pt.fldProject ASC
    ");

    $stmt->execute([
        ':getDate' => $getDate,
        ':empNum' => $empNum,
    ]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $output = array_map(function ($row) {
        $minutes = (int) ($row['projectMinutes'] ?? 0);

        return [
            'projectName' => $row['projectName'] ?? '',
            'projectMinutes' => $minutes,
            'projectHours' => $minutes / 60,
            'projectDeleted' => (int) ($row['projectDeleted'] ?? 0),
        ];
    }, $rows);

    jsonSuccess($output);
} catch (Throwable $e) {
    jsonError('Failed to load day data.', 500);
}