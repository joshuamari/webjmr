<?php

require_once __DIR__ . '/bootstrap.php';

$planID = (int) requireRequestValue('planID', 'Plan ID is required.');
$empNum = trim((string) requireRequestValue('empID', 'Employee ID is required.'));

function getUsedHours(PDO $conn, int $jobID, string $employeeNumber, string $dateStart, string $dateEnd): int
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

    return (int) $stmt->fetchColumn();
}

function getEmployeeName(PDO $conn, string $employeeNumber): string
{
    $stmt = $conn->prepare("
        SELECT CONCAT(fldSurname, ', ', fldFirstname) AS ename
        FROM emp_prof
        WHERE fldEmployeeNum = :employeeNumber
        LIMIT 1
    ");
    $stmt->execute([
        ':employeeNumber' => $employeeNumber,
    ]);

    $name = $stmt->fetchColumn();

    return $name !== false ? (string) $name : '';
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
        WHERE pl.fldID = :planID
    ");
    $stmt->execute([
        ':planID' => $planID,
    ]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $planDetails = [];

    foreach ($rows as $plan) {
        $rawProjStart = strtotime($plan['fldStartDate']);
        $rawProjEnd = strtotime($plan['fldEndDate']);

        $projStart = date("M d, Y", $rawProjStart);
        $projEnd = date("M d, Y", $rawProjEnd);
        $projDays = (int) ceil(($rawProjEnd - $rawProjStart) / (60 * 60 * 24)) + 1;
        $projMH = ((float) $plan['fldHours']) * $projDays;

        $projStatus = $plan['fldStatus'] === null
            ? ""
            : date("M d, Y", strtotime($plan['fldStatus']));

        $usedHours = getUsedHours(
            $connwebjmr,
            (int) $plan['projJobID'],
            $empNum,
            $plan['fldStartDate'],
            $plan['fldEndDate']
        );

        $hoursRemaining = ($projMH - $usedHours) / 60;

        $planDetails[] = [
            'projName' => $plan['projName'],
            'projItem' => $plan['projItem'],
            'projJob' => $plan['projJob'],
            'projStart' => $projStart,
            'projEnd' => $projEnd,
            'hoursRemaining' => $hoursRemaining,
            'projStatus' => $projStatus,
            'planner' => getEmployeeName($connkdt, (string) $plan['fldPlanner']),
            'plannedDate' => date("M d, Y - h:i:sA", strtotime($plan['fldDatePlanned'])),
            'plannedModified' => date("M d, Y - h:i:sA", strtotime($plan['fldDateModified'])),
        ];
    }

    jsonSuccess($planDetails);
} catch (Throwable $e) {
    jsonError('Failed to load planning details.', 500);
}