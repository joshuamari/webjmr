<?php

require_once __DIR__ . '/bootstrap.php';

$getDate = trim((string) requestValue('getDate', date('Y-m-d')));
$empNum = trim((string) requireRequestValue('empNum', 'Employee number is required.'));

try {
    $stmt = $connwebjmr->prepare("
        SELECT
            fldMHType,
            COALESCE(SUM(fldDuration), 0) AS totalMinutes
        FROM dailyreport
        WHERE fldDate = :getDate
          AND fldEmployeeNum = :empNum
        GROUP BY fldMHType
    ");

    $stmt->execute([
        ':getDate' => $getDate,
        ':empNum' => $empNum,
    ]);

    $reg = 0;
    $ot = 0;
    $lv = 0;
    $ams = 0;

    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $mhType = (int) $row['fldMHType'];
        $hours = ((int) $row['totalMinutes']) / 60;

        switch ($mhType) {
            case 0:
                $reg = $hours;
                break;
            case 1:
                $ot = $hours;
                break;
            case 2:
                $lv = $hours;
                break;
        }
    }

    jsonSuccess([
        'reg' => $reg,
        'ot' => $ot,
        'lv' => $lv,
        'ams' => $ams,
    ]);
} catch (Throwable $e) {
    jsonError('Failed to load manhour day data.', 500);
}