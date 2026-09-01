<?php
require_once __DIR__ . '/bootstrap.php';
rdRequireConnections();

try {
    $login = checkAuthentication();
    if ($login['isSuccess'] == false) {
        rdJsonOk([
            'isSuccess' => false,
            'message' => $login['message'] !== '' ? $login['message'] : 'No access',
        ]);
    }

    if (!rdHasAccess($login['data']['id'])) {
        rdJsonOk([
            'isSuccess' => false,
            'message' => 'No access',
        ]);
    }

    $ymSel = isset($_POST['getYMSel']) ? trim((string) $_POST['getYMSel']) : '';
    if (!preg_match('/^\d{4}-\d{2}$/', $ymSel)) {
        rdJsonOk([
            'isSuccess' => false,
            'message' => 'Select a month.',
        ]);
    }

    $requestedGroups = [];
    if (isset($_POST['getGroups'])) {
        $postedGroups = $_POST['getGroups'];
        if (!is_array($postedGroups)) {
            $postedGroups = [$postedGroups];
        }
        foreach ($postedGroups as $groupValue) {
            $abbrev = trim((string) $groupValue);
            if ($abbrev !== '') {
                $requestedGroups[] = $abbrev;
            }
        }
    } elseif (isset($_POST['getGroup'])) {
        $single = trim((string) $_POST['getGroup']);
        if ($single !== '' && $single !== RD_ALL_GROUPS) {
            $requestedGroups[] = $single;
        }
    }
    $requestedGroups = array_values(array_unique($requestedGroups));

    $allowedGroups = getGroups($login['data']['id'], RD_ALL_GROUP_ACCESS);
    $allowedByAbbrev = [];
    foreach ($allowedGroups as $grp) {
        $abbrev = trim((string) ($grp['abbreviation'] ?? ''));
        if ($abbrev === '') {
            continue;
        }
        $allowedByAbbrev[$abbrev] = [
            'abbreviation' => $abbrev,
            'name' => (string) ($grp['name'] ?? $abbrev),
        ];
    }

    if ($requestedGroups === [] && isset($_POST['getGroup']) && trim((string) $_POST['getGroup']) === RD_ALL_GROUPS) {
        $requestedGroups = array_keys($allowedByAbbrev);
    }

    $targetAbbrevs = [];
    foreach (array_keys($allowedByAbbrev) as $abbrev) {
        if (in_array($abbrev, $requestedGroups, true)) {
            $targetAbbrevs[] = $abbrev;
        }
    }

    if ($targetAbbrevs === []) {
        rdJsonOk([
            'isSuccess' => true,
            'month' => $ymSel,
            'groupFilter' => $requestedGroups,
            'showGrandTotal' => false,
            'grandTotalLabel' => '',
            'groups' => [],
            'grandTotalHours' => 0,
        ]);
    }

    $rdItemId = rdItemId($connwebjmr);
    if ($rdItemId < 1) {
        rdJsonOk([
            'isSuccess' => false,
            'message' => 'Research & Development item was not found.',
        ]);
    }

    $firstDay = getFirstday($ymSel, '3');
    $lastDay = getLastday($ymSel, '3', $firstDay);

    $placeholders = implode(',', array_fill(0, count($targetAbbrevs), '?'));
    $hoursSql = "
        SELECT dr.fldGroup, dr.fldEmployeeNum, SUM(dr.fldDuration) AS totalMinutes
        FROM dailyreport AS dr
        WHERE dr.fldItem = ?
          AND dr.fldDate >= ?
          AND dr.fldDate < ?
          AND dr.fldGroup IN ($placeholders)
        GROUP BY dr.fldGroup, dr.fldEmployeeNum
        ORDER BY dr.fldGroup, dr.fldEmployeeNum
    ";
    $hoursStmt = $connwebjmr->prepare($hoursSql);
    $hoursStmt->execute(array_merge([$rdItemId, $firstDay, $lastDay], $targetAbbrevs));
    $hourRows = $hoursStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $minutesByGroup = [];
    $employeeNums = [];
    foreach ($hourRows as $row) {
        $abbrev = trim((string) $row['fldGroup']);
        $empNum = (string) $row['fldEmployeeNum'];
        if ($abbrev === '' || $empNum === '' || !isset($allowedByAbbrev[$abbrev])) {
            continue;
        }
        if (!isset($minutesByGroup[$abbrev])) {
            $minutesByGroup[$abbrev] = [];
        }
        $minutesByGroup[$abbrev][$empNum] = ((float) ($minutesByGroup[$abbrev][$empNum] ?? 0))
            + (float) $row['totalMinutes'];
        $employeeNums[$empNum] = true;
    }

    $namesByEmp = [];
    $empKeys = array_keys($employeeNums);
    if ($empKeys !== []) {
        $namePlaceholders = implode(',', array_fill(0, count($empKeys), '?'));
        $nameSql = "
            SELECT fldEmployeeNum, CONCAT(fldSurname, ', ', fldFirstname) AS ename
            FROM emp_prof
            WHERE fldEmployeeNum IN ($namePlaceholders)
        ";
        $nameStmt = $connkdt->prepare($nameSql);
        $nameStmt->execute($empKeys);
        foreach ($nameStmt->fetchAll(PDO::FETCH_ASSOC) ?: [] as $nameRow) {
            $namesByEmp[(string) $nameRow['fldEmployeeNum']] = trim((string) $nameRow['ename']);
        }
    }

    $groups = [];
    $grandTotalHours = 0.0;
    foreach ($targetAbbrevs as $abbrev) {
        if (!isset($minutesByGroup[$abbrev])) {
            continue;
        }

        $employees = [];
        $groupTotalHours = 0.0;
        ksort($minutesByGroup[$abbrev], SORT_NATURAL);
        foreach ($minutesByGroup[$abbrev] as $empNum => $minutes) {
            $hours = rdMinutesToHours((float) $minutes);
            $name = $namesByEmp[(string) $empNum] ?? '';
            if ($name === '' || $name === ',') {
                $name = 'Unknown';
            }
            $employees[] = [
                'empNum' => (string) $empNum,
                'name' => $name,
                'hours' => $hours,
            ];
            $groupTotalHours += $hours;
        }

        $groupTotalHours = round($groupTotalHours, 2);
        $groups[] = [
            'abbreviation' => $abbrev,
            'name' => $allowedByAbbrev[$abbrev]['name'],
            'employees' => $employees,
            'totalHours' => $groupTotalHours,
        ];
        $grandTotalHours += $groupTotalHours;
    }

    $selectedCount = count($targetAbbrevs);
    $allowedCount = count($allowedByAbbrev);
    $showGrandTotal = $selectedCount > 1;
    $grandTotalLabel = ($showGrandTotal && $selectedCount === $allowedCount)
        ? 'All Groups Total'
        : 'Selected Groups Total';

    rdJsonOk([
        'isSuccess' => true,
        'month' => $ymSel,
        'groupFilter' => $targetAbbrevs,
        'showGrandTotal' => $showGrandTotal,
        'grandTotalLabel' => $grandTotalLabel,
        'groups' => $groups,
        'grandTotalHours' => round($grandTotalHours, 2),
    ]);
} catch (Throwable $e) {
    rdJsonFail($e);
}
