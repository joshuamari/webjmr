<?php

function ensureDailyReportHistoryTable(): void
{
    static $ensured = false;

    if ($ensured) {
        return;
    }

    global $connwebjmr;

    if ($connwebjmr->inTransaction()) {
        throw new RuntimeException('Daily report history table must be ensured outside a transaction.');
    }

    $connwebjmr->exec("
        CREATE TABLE IF NOT EXISTS `dailyreport_history` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `daily_report_id` int(11) NOT NULL,
          `employee_num` int(11) NOT NULL,
          `actor_num` int(11) NOT NULL,
          `actor_name` varchar(200) DEFAULT NULL,
          `actor_role` varchar(100) DEFAULT NULL,
          `report_date` date NOT NULL,
          `action` varchar(20) NOT NULL,
          `is_override` tinyint(1) NOT NULL DEFAULT 0,
          `override_reason` varchar(500) DEFAULT NULL,
          `previous_values` longtext DEFAULT NULL,
          `new_values` longtext DEFAULT NULL,
          `changed_fields` longtext DEFAULT NULL,
          `created_at` datetime NOT NULL,
          PRIMARY KEY (`id`),
          KEY `idx_dr_history_employee_created` (`employee_num`, `created_at`),
          KEY `idx_dr_history_employee_report` (`employee_num`, `report_date`),
          KEY `idx_dr_history_actor` (`actor_num`),
          KEY `idx_dr_history_action` (`action`),
          KEY `idx_dr_history_daily_report` (`daily_report_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $ensured = true;
}

function isDailyReportDateEditable(string $employeeId, string $date): bool
{
    if ($date === '' || strlen($date) < 7) {
        return false;
    }

    $selectedYm = substr($date, 0, 7);
    $nowYm = date('Y-m');

    if ($selectedYm >= $nowYm) {
        return true;
    }

    $access = getPreviousMonthAccessInfo($employeeId);

    if (!empty($access['canAccessAllMonths'])) {
        return true;
    }

    if (empty($access['canAccessPreviousMonth'])) {
        return false;
    }

    return (string) ($access['requestedMonth'] ?? '') === $selectedYm;
}

function assertDailyReportDateEditable(string $employeeId, string $date): void
{
    if (!isDailyReportDateEditable($employeeId, $date)) {
        jsonError('This Daily Report is locked and cannot be modified.', 403);
    }
}

function fetchDailyReportRowById(int $entryId): ?array
{
    global $connwebjmr;

    $stmt = $connwebjmr->prepare("
        SELECT *
        FROM dailyreport
        WHERE fldID = :entryId
        LIMIT 1
    ");
    $stmt->execute([
        ':entryId' => $entryId,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function formatDailyReportDurationDisplay($minutes): string
{
    $total = (int) round((float) $minutes);
    if ($total < 0) {
        $total = 0;
    }

    $hours = intdiv($total, 60);
    $mins = $total % 60;

    return sprintf('%02d:%02d', $hours, $mins);
}

function formatDailyReportMhTypeDisplay($mhType): string
{
    $map = [
        0 => 'Regular',
        1 => 'Overtime',
        2 => 'Leave',
    ];

    $key = (int) $mhType;

    return $map[$key] ?? (string) $mhType;
}

function drHistoryLookupName(PDO $conn, string $sql, array $params, string $fallback = ''): string
{
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $value = $stmt->fetchColumn();

    if ($value === false || $value === null || $value === '') {
        return $fallback;
    }

    return (string) $value;
}

function drHistoryEmployeeDisplayName(string $employeeId): string
{
    $profile = getEmployeeProfile($employeeId);
    $name = trim(($profile['fldFirstname'] ?? '') . ' ' . ($profile['fldSurname'] ?? ''));

    return $name !== '' ? $name : 'Employee';
}

function drHistoryEmployeeRole(string $employeeId): string
{
    global $connkdt;

    $profile = getEmployeeProfile($employeeId);
    $desig = trim((string) ($profile['fldDesig'] ?? ''));

    if ($desig === '') {
        return '';
    }

    $full = drHistoryLookupName(
        $connkdt,
        "SELECT fldFull FROM kdtpositions WHERE fldAcro = :acro LIMIT 1",
        [':acro' => $desig],
        $desig
    );

    return $full;
}

function drHistoryEmployeeInitials(string $name): string
{
    $parts = preg_split('/\s+/', trim($name)) ?: [];
    $initials = '';

    foreach ($parts as $part) {
        if ($part === '') {
            continue;
        }
        $initials .= strtoupper(substr($part, 0, 1));
        if (strlen($initials) >= 2) {
            break;
        }
    }

    return $initials !== '' ? $initials : 'DR';
}

function buildDailyReportFieldSnapshot(array $row): array
{
    global $connwebjmr;

    $locationName = drHistoryLookupName(
        $connwebjmr,
        "SELECT fldLocation FROM dispatch_locations WHERE fldID = :id LIMIT 1",
        [':id' => $row['fldLocation'] ?? 0],
        (string) ($row['fldLocation'] ?? '')
    );

    $projectName = drHistoryLookupName(
        $connwebjmr,
        "SELECT fldProject FROM projectstable WHERE fldID = :id LIMIT 1",
        [':id' => $row['fldProject'] ?? 0],
        (string) ($row['fldProject'] ?? '')
    );

    $itemName = drHistoryLookupName(
        $connwebjmr,
        "SELECT fldItem FROM itemofworkstable WHERE fldID = :id LIMIT 1",
        [':id' => $row['fldItem'] ?? 0],
        (string) ($row['fldItem'] ?? '')
    );

    $jobName = '';
    $jobId = $row['fldJobRequestDescription'] ?? null;
    if ($jobId !== null && $jobId !== '') {
        $jobName = drHistoryLookupName(
            $connwebjmr,
            "SELECT fldJob FROM drawingreference WHERE fldID = :id LIMIT 1",
            [':id' => $jobId],
            (string) $jobId
        );
    }

    $towCode = '';
    $towName = '';
    $towId = $row['fldTOW'] ?? null;
    if ($towId !== null && $towId !== '') {
        $towStmt = $connwebjmr->prepare("
            SELECT fldCode, fldTOW
            FROM typesofworktable
            WHERE fldID = :id
            LIMIT 1
        ");
        $towStmt->execute([':id' => $towId]);
        $towRow = $towStmt->fetch(PDO::FETCH_ASSOC) ?: [];
        $towCode = trim((string) ($towRow['fldCode'] ?? ''));
        $towName = trim((string) ($towRow['fldTOW'] ?? ''));
        if ($towCode !== '' && $towName !== '') {
            $towName = $towCode . ' - ' . $towName;
        } elseif ($towCode !== '') {
            $towName = $towCode;
        }
    }

    $checkerName = '';
    $checkerId = $row['fldChecker'] ?? null;
    if ($checkerId !== null && $checkerId !== '' && (int) $checkerId !== 0) {
        $checkerName = drHistoryEmployeeDisplayName((string) $checkerId);
        if ($checkerName === 'Employee') {
            $checkerName = (string) $checkerId;
        }
    }

    $revision = (int) ($row['fldRevision'] ?? 0);

    return [
        'group' => [
            'label' => 'Group',
            'raw' => (string) ($row['fldGroup'] ?? ''),
            'value' => (string) ($row['fldGroup'] ?? ''),
        ],
        'location' => [
            'label' => 'Location',
            'raw' => (string) ($row['fldLocation'] ?? ''),
            'value' => $locationName,
        ],
        'project' => [
            'label' => 'Project',
            'raw' => (string) ($row['fldProject'] ?? ''),
            'value' => $projectName,
        ],
        'item' => [
            'label' => 'Item of Works',
            'raw' => (string) ($row['fldItem'] ?? ''),
            'value' => $itemName,
        ],
        'job' => [
            'label' => 'Job Request Description',
            'raw' => (string) ($jobId ?? ''),
            'value' => $jobName,
        ],
        'twoThree' => [
            'label' => '2D/3D',
            'raw' => (string) ($row['fld2D3D'] ?? ''),
            'value' => (string) ($row['fld2D3D'] ?? ''),
        ],
        'revision' => [
            'label' => 'Revision',
            'raw' => (string) $revision,
            'value' => $revision === 1 ? 'Yes' : 'No',
        ],
        'tow' => [
            'label' => 'Type of Work',
            'raw' => (string) ($towId ?? ''),
            'value' => $towName,
        ],
        'checker' => [
            'label' => 'Checking',
            'raw' => (string) ($checkerId ?? ''),
            'value' => $checkerName,
        ],
        'hours' => [
            'label' => 'No. of Hours',
            'raw' => (string) (int) round((float) ($row['fldDuration'] ?? 0)),
            'value' => formatDailyReportDurationDisplay($row['fldDuration'] ?? 0),
        ],
        'mhType' => [
            'label' => 'Manhour Type',
            'raw' => (string) ($row['fldMHType'] ?? ''),
            'value' => formatDailyReportMhTypeDisplay($row['fldMHType'] ?? ''),
        ],
        'remarks' => [
            'label' => 'Remarks',
            'raw' => (string) ($row['fldRemarks'] ?? ''),
            'value' => (string) ($row['fldRemarks'] ?? ''),
        ],
        'trGroup' => [
            'label' => 'Group of Trainees',
            'raw' => (string) ($row['fldTrGroup'] ?? ''),
            'value' => (string) ($row['fldTrGroup'] ?? ''),
        ],
        'reportDate' => [
            'label' => 'Report Date',
            'raw' => (string) ($row['fldDate'] ?? ''),
            'value' => (string) ($row['fldDate'] ?? ''),
        ],
    ];
}

function persistableDailyReportSnapshot(array $snapshot): array
{
    $out = [];

    foreach ($snapshot as $key => $field) {
        $out[$key] = [
            'label' => $field['label'],
            'value' => $field['value'],
        ];
    }

    return $out;
}

function diffDailyReportSnapshots(array $previous, array $next): array
{
    $changed = [];

    $keys = array_unique(array_merge(array_keys($previous), array_keys($next)));

    foreach ($keys as $key) {
        $prevRaw = (string) ($previous[$key]['raw'] ?? '');
        $nextRaw = (string) ($next[$key]['raw'] ?? '');

        if ($prevRaw !== $nextRaw) {
            $changed[] = $key;
        }
    }

    return $changed;
}

function buildDailyReportRowFromWrite(array $values): array
{
    return [
        'fldEmployeeNum' => $values['empNum'] ?? '',
        'fldGroup' => $values['grpAbbrev'] ?? '',
        'fldGroupID' => $values['grpID'] ?? '',
        'fldDate' => $values['drDate'] ?? '',
        'fldLocation' => $values['location'] ?? '',
        'fldProject' => $values['project'] ?? '',
        'fldItem' => $values['item'] ?? '',
        'fldJobRequestDescription' => $values['job'] ?? null,
        'fld2D3D' => $values['twoThree'] ?? null,
        'fldRevision' => $values['revision'] ?? 0,
        'fldTOW' => $values['tow'] ?? null,
        'fldChecker' => $values['checker'] ?? null,
        'fldDuration' => $values['duration'] ?? 0,
        'fldMHType' => $values['mhType'] ?? 0,
        'fldRemarks' => $values['remarks'] ?? null,
        'fldTrGroup' => $values['trGroup'] ?? null,
    ];
}

function recordDailyReportHistory(array $payload): void
{
    ensureDailyReportHistoryTable();

    $action = strtolower(trim((string) ($payload['action'] ?? '')));
    $allowed = ['created', 'updated', 'deleted'];

    if (!in_array($action, $allowed, true)) {
        return;
    }

    $changedFields = $payload['changedFields'] ?? [];
    if ($action === 'updated' && empty($changedFields)) {
        return;
    }

    $actorNum = (string) ($payload['actorNum'] ?? '');
    $employeeNum = (string) ($payload['employeeNum'] ?? '');
    $isOverride = !empty($payload['isOverride']) || ($actorNum !== '' && $employeeNum !== '' && $actorNum !== $employeeNum);
    $overrideReason = $isOverride ? trim((string) ($payload['overrideReason'] ?? '')) : '';

    global $connwebjmr;

    $stmt = $connwebjmr->prepare("
        INSERT INTO dailyreport_history (
            daily_report_id,
            employee_num,
            actor_num,
            actor_name,
            actor_role,
            report_date,
            action,
            is_override,
            override_reason,
            previous_values,
            new_values,
            changed_fields,
            created_at
        ) VALUES (
            :dailyReportId,
            :employeeNum,
            :actorNum,
            :actorName,
            :actorRole,
            :reportDate,
            :action,
            :isOverride,
            :overrideReason,
            :previousValues,
            :newValues,
            :changedFields,
            :createdAt
        )
    ");

    $stmt->execute([
        ':dailyReportId' => (int) ($payload['dailyReportId'] ?? 0),
        ':employeeNum' => (int) $employeeNum,
        ':actorNum' => (int) $actorNum,
        ':actorName' => $payload['actorName'] ?? drHistoryEmployeeDisplayName($actorNum),
        ':actorRole' => $payload['actorRole'] ?? drHistoryEmployeeRole($actorNum),
        ':reportDate' => $payload['reportDate'] ?? date('Y-m-d'),
        ':action' => $action,
        ':isOverride' => $isOverride ? 1 : 0,
        ':overrideReason' => $overrideReason !== '' ? $overrideReason : null,
        ':previousValues' => json_encode($payload['previousValues'] ?? new stdClass(), JSON_UNESCAPED_UNICODE),
        ':newValues' => json_encode($payload['newValues'] ?? new stdClass(), JSON_UNESCAPED_UNICODE),
        ':changedFields' => json_encode(array_values($changedFields), JSON_UNESCAPED_UNICODE),
        ':createdAt' => date('Y-m-d H:i:s'),
    ]);
}

function recordDailyReportCreatedHistory(int $entryId, array $row, string $actorNum, string $overrideReason = ''): void
{
    $snapshot = persistableDailyReportSnapshot(buildDailyReportFieldSnapshot($row));

    recordDailyReportHistory([
        'dailyReportId' => $entryId,
        'employeeNum' => (string) ($row['fldEmployeeNum'] ?? ''),
        'actorNum' => $actorNum,
        'reportDate' => $row['fldDate'] ?? date('Y-m-d'),
        'action' => 'created',
        'overrideReason' => $overrideReason,
        'previousValues' => new stdClass(),
        'newValues' => $snapshot,
        'changedFields' => array_keys($snapshot),
    ]);
}

function recordDailyReportUpdatedHistory(int $entryId, array $oldRow, array $newRow, string $actorNum, string $overrideReason = ''): bool
{
    $oldSnapshot = buildDailyReportFieldSnapshot($oldRow);
    $newSnapshot = buildDailyReportFieldSnapshot($newRow);
    $changed = diffDailyReportSnapshots($oldSnapshot, $newSnapshot);

    if (empty($changed)) {
        return false;
    }

    $prevStore = [];
    $nextStore = [];

    foreach ($changed as $key) {
        $prevStore[$key] = [
            'label' => $oldSnapshot[$key]['label'] ?? $key,
            'value' => $oldSnapshot[$key]['value'] ?? '',
        ];
        $nextStore[$key] = [
            'label' => $newSnapshot[$key]['label'] ?? $key,
            'value' => $newSnapshot[$key]['value'] ?? '',
        ];
    }

    recordDailyReportHistory([
        'dailyReportId' => $entryId,
        'employeeNum' => (string) ($newRow['fldEmployeeNum'] ?? $oldRow['fldEmployeeNum'] ?? ''),
        'actorNum' => $actorNum,
        'reportDate' => $newRow['fldDate'] ?? $oldRow['fldDate'] ?? date('Y-m-d'),
        'action' => 'updated',
        'overrideReason' => $overrideReason,
        'previousValues' => $prevStore,
        'newValues' => $nextStore,
        'changedFields' => $changed,
    ]);

    return true;
}

function recordDailyReportDeletedHistory(int $entryId, array $row, string $actorNum, string $overrideReason = ''): void
{
    $snapshot = persistableDailyReportSnapshot(buildDailyReportFieldSnapshot($row));

    recordDailyReportHistory([
        'dailyReportId' => $entryId,
        'employeeNum' => (string) ($row['fldEmployeeNum'] ?? ''),
        'actorNum' => $actorNum,
        'reportDate' => $row['fldDate'] ?? date('Y-m-d'),
        'action' => 'deleted',
        'overrideReason' => $overrideReason,
        'previousValues' => $snapshot,
        'newValues' => new stdClass(),
        'changedFields' => array_keys($snapshot),
    ]);
}

function decodeHistoryJson($value, $fallback)
{
    if ($value === null || $value === '') {
        return $fallback;
    }

    $decoded = json_decode((string) $value, true);

    return is_array($decoded) ? $decoded : $fallback;
}

function formatHistoryTimestamp(string $datetime): string
{
    try {
        $dt = new DateTime($datetime);
        return $dt->format('M d, Y, g:i A');
    } catch (Throwable $e) {
        return $datetime;
    }
}

function formatHistoryReportDate(string $date): string
{
    try {
        $dt = new DateTime($date);
        return $dt->format('M d, Y');
    } catch (Throwable $e) {
        return $date;
    }
}

function buildHistoryChangesList(array $previousValues, array $newValues, array $changedFields): array
{
    $changes = [];
    $keys = $changedFields;

    if (empty($keys)) {
        $keys = array_unique(array_merge(array_keys($previousValues), array_keys($newValues)));
    }

    foreach ($keys as $key) {
        if ($key === 'reportDate') {
            continue;
        }

        $label = $newValues[$key]['label'] ?? $previousValues[$key]['label'] ?? $key;
        $prev = $previousValues[$key]['value'] ?? '';
        $next = $newValues[$key]['value'] ?? '';

        if ($prev === '' && $next === '') {
            continue;
        }

        $changes[] = [
            'field' => $label,
            'previousValue' => $prev === '' ? '—' : $prev,
            'newValue' => $next === '' ? '—' : $next,
        ];
    }

    return $changes;
}

function getDailyReportHistory(array $filters): array
{
    ensureDailyReportHistoryTable();

    global $connwebjmr;

    $employeeNum = (int) ($filters['employeeNum'] ?? 0);
    $dateFrom = trim((string) ($filters['dateFrom'] ?? ''));
    $dateTo = trim((string) ($filters['dateTo'] ?? ''));
    $action = strtolower(trim((string) ($filters['action'] ?? 'all')));
    $changedBy = trim((string) ($filters['changedBy'] ?? 'all'));
    $override = strtolower(trim((string) ($filters['override'] ?? 'all')));
    $sort = strtolower(trim((string) ($filters['sort'] ?? 'newest')));

    $where = ['employee_num = :employeeNum'];
    $params = [':employeeNum' => $employeeNum];

    if ($dateFrom !== '') {
        $where[] = 'created_at >= :dateFrom';
        $params[':dateFrom'] = $dateFrom . ' 00:00:00';
    }

    if ($dateTo !== '') {
        $where[] = 'created_at <= :dateTo';
        $params[':dateTo'] = $dateTo . ' 23:59:59';
    }

    if (in_array($action, ['created', 'updated', 'deleted'], true)) {
        $where[] = 'action = :action';
        $params[':action'] = $action;
    }

    if ($changedBy !== '' && strtolower($changedBy) !== 'all') {
        $where[] = 'actor_num = :changedBy';
        $params[':changedBy'] = (int) $changedBy;
    }

    if ($override === 'yes') {
        $where[] = 'is_override = 1';
    } elseif ($override === 'no') {
        $where[] = 'is_override = 0';
    }

    $order = $sort === 'oldest' ? 'ASC' : 'DESC';
    $whereSql = implode(' AND ', $where);

    $stmt = $connwebjmr->prepare("
        SELECT *
        FROM dailyreport_history
        WHERE {$whereSql}
        ORDER BY created_at {$order}, id {$order}
    ");
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $employeeName = drHistoryEmployeeDisplayName((string) $employeeNum);

    $records = [];
    foreach ($rows as $row) {
        $previousValues = decodeHistoryJson($row['previous_values'] ?? '', []);
        $newValues = decodeHistoryJson($row['new_values'] ?? '', []);
        $changedFields = decodeHistoryJson($row['changed_fields'] ?? '', []);
        $actorName = trim((string) ($row['actor_name'] ?? ''));
        if ($actorName === '') {
            $actorName = drHistoryEmployeeDisplayName((string) $row['actor_num']);
        }

        $actionKey = (string) $row['action'];
        $isOverride = (int) $row['is_override'] === 1;
        $actionLabel = ucfirst($actionKey) . ' daily report';
        if ($isOverride) {
            $actionLabel = ucfirst($actionKey) . ' ' . $employeeName . "'s daily report";
        }

        $records[] = [
            'id' => (int) $row['id'],
            'dailyReportId' => (int) $row['daily_report_id'],
            'timestamp' => formatHistoryTimestamp((string) $row['created_at']),
            'actorName' => $actorName,
            'actorRole' => (string) ($row['actor_role'] ?? ''),
            'actorInitials' => drHistoryEmployeeInitials($actorName),
            'action' => $actionKey,
            'actionLabel' => $actionLabel,
            'reportDate' => formatHistoryReportDate((string) $row['report_date']),
            'reportDateRaw' => (string) $row['report_date'],
            'isOverride' => $isOverride,
            'overrideReason' => (string) ($row['override_reason'] ?? ''),
            'changes' => buildHistoryChangesList($previousValues, $newValues, $changedFields),
        ];
    }

    $actorStmt = $connwebjmr->prepare("
        SELECT DISTINCT actor_num, actor_name
        FROM dailyreport_history
        WHERE employee_num = :employeeNum
        ORDER BY actor_name ASC, actor_num ASC
    ");
    $actorStmt->execute([
        ':employeeNum' => $employeeNum,
    ]);

    $actors = [];
    foreach ($actorStmt->fetchAll(PDO::FETCH_ASSOC) ?: [] as $actorRow) {
        $name = trim((string) ($actorRow['actor_name'] ?? ''));
        if ($name === '') {
            $name = drHistoryEmployeeDisplayName((string) $actorRow['actor_num']);
        }

        $actors[] = [
            'empNum' => (string) $actorRow['actor_num'],
            'name' => $name,
        ];
    }

    return [
        'employee' => [
            'empNum' => (string) $employeeNum,
            'name' => $employeeName,
        ],
        'actors' => $actors,
        'records' => $records,
        'total' => count($records),
        'filtersActive' => (
            $action !== 'all'
            || (strtolower($changedBy) !== 'all' && $changedBy !== '')
            || ($override !== 'all' && $override !== '')
        ),
    ];
}

function assertCanViewDailyReportHistory(string $viewerId, string $employeeNum): void
{
    if ($viewerId === $employeeNum) {
        return;
    }

    if (hasOverridePermission($viewerId)) {
        return;
    }

    jsonError('You are not allowed to view this history.', 403);
}
