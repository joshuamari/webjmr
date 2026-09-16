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
            if ($abbrev !== '' && $abbrev !== RD_ALL_GROUPS) {
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

    // Empty selection means All Groups (still intersected with permitted groups).
    if ($requestedGroups === []) {
        $requestedGroups = array_keys($allowedByAbbrev);
    }

    $targetAbbrevs = [];
    foreach (array_keys($allowedByAbbrev) as $abbrev) {
        if (in_array($abbrev, $requestedGroups, true)) {
            $targetAbbrevs[] = $abbrev;
        }
    }

    $emptyPayload = [
        'isSuccess' => true,
        'month' => $ymSel,
        'groupFilter' => $requestedGroups,
        'showGrandTotal' => false,
        'grandTotalLabel' => '',
        'groups' => [],
        'jrds' => [],
        'grandTotalHours' => 0,
        'grandHoursByJrd' => new stdClass(),
        'summary' => [
            'totalHours' => 0,
            'activityCount' => 0,
            'contributorCount' => 0,
            'groupCount' => 0,
        ],
    ];

    if ($targetAbbrevs === []) {
        rdJsonOk($emptyPayload);
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
        SELECT
            dr.fldGroup,
            dr.fldEmployeeNum,
            dr.fldJobRequestDescription AS jrdId,
            jrd.fldJob AS jrdDescription,
            jrd.fldGroup AS jrdGroup,
            jrd.fldPriority AS jrdPriority,
            SUM(dr.fldDuration) AS totalMinutes
        FROM dailyreport AS dr
        LEFT JOIN drawingreference AS jrd
            ON dr.fldJobRequestDescription = jrd.fldID
        WHERE dr.fldItem = ?
          AND dr.fldDate >= ?
          AND dr.fldDate < ?
          AND dr.fldGroup IN ($placeholders)
        GROUP BY
            dr.fldGroup,
            dr.fldEmployeeNum,
            dr.fldJobRequestDescription,
            jrd.fldJob,
            jrd.fldGroup,
            jrd.fldPriority
        ORDER BY dr.fldGroup, dr.fldEmployeeNum
    ";
    $hoursStmt = $connwebjmr->prepare($hoursSql);
    $hoursStmt->execute(array_merge([$rdItemId, $firstDay, $lastDay], $targetAbbrevs));
    $hourRows = $hoursStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $minutesByGroupEmp = [];
    $minutesByGroupEmpJrd = [];
    $jrdMeta = [];
    $employeeNums = [];

    foreach ($hourRows as $row) {
        $abbrev = trim((string) $row['fldGroup']);
        $empNum = (string) $row['fldEmployeeNum'];
        if ($abbrev === '' || $empNum === '' || !isset($allowedByAbbrev[$abbrev])) {
            continue;
        }

        $rawJrdId = trim((string) ($row['jrdId'] ?? ''));
        $jrdGroup = trim((string) ($row['jrdGroup'] ?? ''));
        if ($rawJrdId === '' || $rawJrdId === '0') {
            $jrdId = '__none__:' . $abbrev;
            $jrdGroup = $abbrev;
            $jrdDescription = 'Unspecified';
        } else {
            $jrdId = $rawJrdId;
            if ($jrdGroup === '' || !isset($allowedByAbbrev[$jrdGroup])) {
                $jrdGroup = $abbrev;
            }
            $jrdDescription = trim((string) ($row['jrdDescription'] ?? ''));
            if ($jrdDescription === '') {
                $jrdDescription = 'JRD #' . $jrdId;
            }
        }

        $minutes = (float) $row['totalMinutes'];
        if (!isset($minutesByGroupEmp[$abbrev])) {
            $minutesByGroupEmp[$abbrev] = [];
            $minutesByGroupEmpJrd[$abbrev] = [];
        }
        if (!isset($minutesByGroupEmp[$abbrev][$empNum])) {
            $minutesByGroupEmp[$abbrev][$empNum] = 0.0;
            $minutesByGroupEmpJrd[$abbrev][$empNum] = [];
        }
        $minutesByGroupEmp[$abbrev][$empNum] += $minutes;
        $minutesByGroupEmpJrd[$abbrev][$empNum][$jrdId] =
            ($minutesByGroupEmpJrd[$abbrev][$empNum][$jrdId] ?? 0.0) + $minutes;
        $employeeNums[$empNum] = true;

        if (!isset($jrdMeta[$jrdId])) {
            $jrdMeta[$jrdId] = [
                'id' => $jrdId,
                'description' => $jrdDescription,
                'group' => $jrdGroup,
                'groupName' => $allowedByAbbrev[$jrdGroup]['name'] ?? $jrdGroup,
                'priority' => (int) ($row['jrdPriority'] ?? 0),
            ];
        }
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

    $groupOrder = array_flip($targetAbbrevs);
    uasort($jrdMeta, function ($a, $b) use ($groupOrder) {
        $aPos = $groupOrder[$a['group']] ?? 9999;
        $bPos = $groupOrder[$b['group']] ?? 9999;
        if ($aPos !== $bPos) {
            return $aPos <=> $bPos;
        }
        if ($a['priority'] !== $b['priority']) {
            return $a['priority'] <=> $b['priority'];
        }
        $nameCmp = strcasecmp($a['description'], $b['description']);
        if ($nameCmp !== 0) {
            return $nameCmp;
        }
        return strcmp((string) $a['id'], (string) $b['id']);
    });
    $jrds = array_values($jrdMeta);

    $groups = [];
    $grandTotalHours = 0.0;
    $grandMinutesByJrd = [];

    foreach ($targetAbbrevs as $abbrev) {
        if (!isset($minutesByGroupEmp[$abbrev])) {
            continue;
        }

        $employees = [];
        $groupTotalHours = 0.0;
        $groupMinutesByJrd = [];
        $groupJrdIds = [];
        ksort($minutesByGroupEmp[$abbrev], SORT_NATURAL);

        foreach ($minutesByGroupEmp[$abbrev] as $empNum => $minutes) {
            $hours = rdMinutesToHours((float) $minutes);
            $name = $namesByEmp[(string) $empNum] ?? '';
            if ($name === '' || $name === ',') {
                $name = 'Unknown';
            }

            $hoursByJrd = [];
            foreach ($minutesByGroupEmpJrd[$abbrev][$empNum] as $jrdId => $jrdMinutes) {
                $jrdHours = rdMinutesToHours((float) $jrdMinutes);
                if ($jrdHours == 0.0) {
                    continue;
                }
                $hoursByJrd[$jrdId] = $jrdHours;
                $groupMinutesByJrd[$jrdId] = ($groupMinutesByJrd[$jrdId] ?? 0.0) + (float) $jrdMinutes;
                $grandMinutesByJrd[$jrdId] = ($grandMinutesByJrd[$jrdId] ?? 0.0) + (float) $jrdMinutes;
                if (isset($jrdMeta[$jrdId]) && ($jrdMeta[$jrdId]['group'] ?? '') === $abbrev) {
                    $groupJrdIds[$jrdId] = true;
                }
            }

            $employees[] = [
                'empNum' => (string) $empNum,
                'name' => $name,
                'hours' => $hours,
                'hoursByJrd' => $hoursByJrd === [] ? new stdClass() : $hoursByJrd,
            ];
            $groupTotalHours += $hours;
        }

        $hoursByJrd = [];
        foreach ($groupMinutesByJrd as $jrdId => $jrdMinutes) {
            $hoursByJrd[$jrdId] = rdMinutesToHours((float) $jrdMinutes);
        }

        $orderedGroupJrdIds = [];
        foreach ($jrds as $jrd) {
            if (isset($groupJrdIds[$jrd['id']])) {
                $orderedGroupJrdIds[] = $jrd['id'];
            }
        }

        $groupTotalHours = round($groupTotalHours, 2);
        $groups[] = [
            'abbreviation' => $abbrev,
            'name' => $allowedByAbbrev[$abbrev]['name'],
            'employees' => $employees,
            'totalHours' => $groupTotalHours,
            'jrdIds' => $orderedGroupJrdIds,
            'hoursByJrd' => $hoursByJrd === [] ? new stdClass() : $hoursByJrd,
            'activityCount' => count($orderedGroupJrdIds),
            'contributorCount' => count($employees),
        ];
        $grandTotalHours += $groupTotalHours;
    }

    $grandHoursByJrd = [];
    foreach ($jrds as $jrd) {
        if (isset($grandMinutesByJrd[$jrd['id']])) {
            $grandHoursByJrd[$jrd['id']] = rdMinutesToHours((float) $grandMinutesByJrd[$jrd['id']]);
        }
    }

    $selectedCount = count($targetAbbrevs);
    $allowedCount = count($allowedByAbbrev);
    $showGrandTotal = $selectedCount > 1;
    $grandTotalLabel = ($showGrandTotal && $selectedCount === $allowedCount)
        ? 'GRAND TOTAL (ALL GROUPS)'
        : 'GRAND TOTAL (SELECTED GROUPS)';
    $summaryTotalLabel = ($selectedCount === $allowedCount)
        ? 'ALL GROUPS TOTAL'
        : 'SELECTED GROUPS TOTAL';

    $uniqueEmployees = [];
    foreach ($groups as $group) {
        foreach ($group['employees'] as $emp) {
            $uniqueEmployees[$emp['empNum']] = true;
        }
    }

    rdJsonOk([
        'isSuccess' => true,
        'month' => $ymSel,
        'groupFilter' => $targetAbbrevs,
        'showGrandTotal' => $showGrandTotal,
        'grandTotalLabel' => $grandTotalLabel,
        'summaryTotalLabel' => $summaryTotalLabel,
        'groups' => $groups,
        'jrds' => $jrds,
        'grandTotalHours' => round($grandTotalHours, 2),
        'grandHoursByJrd' => $grandHoursByJrd === [] ? new stdClass() : $grandHoursByJrd,
        'summary' => [
            'totalHours' => round($grandTotalHours, 2),
            'activityCount' => count($jrds),
            'contributorCount' => count($uniqueEmployees),
            'groupCount' => count($groups),
        ],
    ]);
} catch (Throwable $e) {
    rdJsonFail($e);
}
