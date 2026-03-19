<?php

require_once __DIR__ . '/bootstrap.php';

$getEmployee = trim((string) requireRequestValue('getEmployee', 'Employee number is required.'));
$selDate = trim((string) requestValue('selDate', date('Y-m-d')));

function getUsedHours(PDO $conn, int $jobID, string $employeeNumber, string $dateStart, string $dateEnd): float
{
    $stmt = $conn->prepare("
        SELECT COALESCE(SUM(fldDuration), 0)
        FROM dailyreport
        WHERE fldEmployeeNum = :employeeNumber
          AND fldJobRequestDescription = :jobID
          AND fldDate BETWEEN :dateStart AND :dateEnd
    ");
    $stmt->execute([
        ':employeeNumber' => $employeeNumber,
        ':jobID' => $jobID,
        ':dateStart' => $dateStart,
        ':dateEnd' => $dateEnd,
    ]);

    $minutes = (int) $stmt->fetchColumn();

    return $minutes / 60;
}

try {
    $stmt = $connwebjmr->prepare("
        SELECT
            pl.*,
            dr.fldID AS projJobID,
            dr.fldJob AS projJob,
            pt.fldProject AS projName,
            it.fldItem AS projItem
        FROM planning AS pl
        JOIN drawingreference AS dr
            ON pl.fldJob = dr.fldID
        JOIN projectstable AS pt
            ON dr.fldProject = pt.fldID
        JOIN itemofworkstable AS it
            ON dr.fldItem = it.fldID
        WHERE pl.fldEmployeeNum = :getEmployee
          AND :selDate BETWEEN pl.fldStartDate AND pl.fldEndDate
        ORDER BY pl.fldStartDate DESC
    ");
    $stmt->execute([
        ':getEmployee' => $getEmployee,
        ':selDate' => $selDate,
    ]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $planned = [];

    foreach ($rows as $plan) {
        $projStatus = $plan['fldStatus'];
        if ($projStatus !== null) {
            $projStatus = date("M d, Y", strtotime($projStatus));
        }

        $planned[] = [
            'planID' => (int) $plan['fldID'],
            'projName' => $plan['projName'] ?? '',
            'projItem' => $plan['projItem'] ?? '',
            'projJob' => $plan['projJob'] ?? '',
            'projMH' => ((float) $plan['fldHours']) / 60,
            'usedHours' => getUsedHours(
                $connwebjmr,
                (int) $plan['projJobID'],
                $getEmployee,
                $plan['fldStartDate'],
                $plan['fldEndDate']
            ),
            'projStatus' => $projStatus ?? '',
        ];
    }

    jsonSuccess($planned);
} catch (Throwable $e) {
    jsonError('Failed to load plans.', 500);
}