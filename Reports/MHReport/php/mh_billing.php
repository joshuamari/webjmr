<?php

/**
 * MH Report internal billing shares (KDT vs BU).
 *
 * Edit mhKdtShareByItemName() when finance changes the split.
 * Values are the KDT share 0–100; BU receives the remainder.
 *   100 = all hours to KDT columns (K1/K2)
 *     0 = all hours to BU columns (B1/B2)
 *    70 = 70% KDT, 30% BU (example for a future change)
 *
 * Looked up by item name so IDs can differ per environment.
 * Management project hours are not in this map (M vs K is handled separately).
 */

function mhNormalizeItemName(string $name): string
{
    $collapsed = preg_replace('/\s+/', ' ', $name);

    return strtolower(trim($collapsed === null ? $name : $collapsed));
}

/**
 * Canonical item names as they appear in itemofworkstable.
 * Old labels with a % suffix are listed too so pre-rename DBs still bill correctly.
 *
 * @return array<string, int>
 */
function mhKdtShareByItemName(): array
{
    return [
        'Research & Development' => 100,
        'Meeting (Kaizen, Outing or Year-end party related to KDT)' => 100,
        'Kaizen' => 100,
        'Presentation' => 100,
        'Training for New Employee (3 Months)' => 100,
        'Training for New Employee (3 Months)- [50% KDT]' => 100,
        'Trainer for Multiple BU Participants' => 100,
        'Trainer for Multiple BU Participants- [50% KDT]' => 100,
        'Trainer for One BU Participants' => 100,
        'Trainer for One BU Participants- [100% KHI]' => 100,
        'Business Trip, Seminar (Requested by KDT)' => 100,
        'Medical' => 100,
        'Calamity' => 100,
        'Trainer for KHI Engineer' => 0,
        'Development (Requested  by KDT Management)' => 100,
        'Analysis (Requested  by KDT Management)' => 100,
        'IT (Requested  by KDT Management)' => 100,
    ];
}

function mhShareForItemName(string $itemName, array $shareByNormalizedName): ?int
{
    $normalized = mhNormalizeItemName($itemName);
    if (array_key_exists($normalized, $shareByNormalizedName)) {
        return $shareByNormalizedName[$normalized];
    }

    $bestShare = null;
    $bestLen = -1;
    foreach ($shareByNormalizedName as $canonical => $share) {
        $len = strlen($canonical);
        if ($len > $bestLen && strncmp($normalized, $canonical, $len) === 0) {
            $bestShare = $share;
            $bestLen = $len;
        }
    }

    return $bestShare;
}

function mhClampShare(int $share): int
{
    if ($share < 0) {
        return 0;
    }

    if ($share > 100) {
        return 100;
    }

    return $share;
}

function mhFetchIdByName(PDO $conn, string $sql, array $params = []): int
{
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $value = $stmt->fetchColumn();

    return $value !== false ? (int) $value : 0;
}

/**
 * @return array{
 *   mngProjID: int,
 *   solProjID: int,
 *   leaveID: int,
 *   defaultProjectIds: int[],
 *   allDefaultProjectIds: int[],
 *   noCounterpartBU: string[],
 *   kdtShareByItemId: array<string, int>
 * }
 */
function mhBillingContext(PDO $connwebjmr, PDO $connkdt): array
{
    static $cache = null;

    if ($cache !== null) {
        return $cache;
    }

    $leaveID = mhFetchIdByName(
        $connwebjmr,
        "SELECT fldID FROM projectstable WHERE fldProject = :name LIMIT 1",
        [':name' => 'Leave']
    );
    $mngProjID = mhFetchIdByName(
        $connwebjmr,
        "SELECT fldID FROM projectstable WHERE fldProject = :name LIMIT 1",
        [':name' => 'Management']
    );
    $solProjID = mhFetchIdByName(
        $connwebjmr,
        "SELECT fldID FROM projectstable WHERE fldProject = :name LIMIT 1",
        [':name' => 'Development, Analysis & IT']
    );

    $defaultStmt = $connwebjmr->query(
        "SELECT fldID FROM projectstable WHERE fldDirect = 0 AND fldDelete = 0"
    );
    $defaultIds = array_map('intval', $defaultStmt ? $defaultStmt->fetchAll(PDO::FETCH_COLUMN) : []);
    $defaultProjectIds = array_values(array_filter(
        $defaultIds,
        static function ($id) use ($leaveID) {
            return $id !== $leaveID;
        }
    ));

    $noCounterpartBU = [];
    $ncpStmt = $connkdt->query("SELECT fldBU FROM kdtbu WHERE fldKHICounterpart = 0");
    if ($ncpStmt) {
        $noCounterpartBU = array_map('strval', $ncpStmt->fetchAll(PDO::FETCH_COLUMN) ?: []);
    }

    $shareByNormalizedName = [];
    foreach (mhKdtShareByItemName() as $itemName => $share) {
        $shareByNormalizedName[mhNormalizeItemName($itemName)] = mhClampShare((int) $share);
    }

    $itemStmt = $connwebjmr->query(
        "SELECT fldID, fldItem FROM itemofworkstable WHERE fldDelete = '0'"
    );
    $kdtShareByItemId = [];
    if ($itemStmt) {
        foreach ($itemStmt->fetchAll(PDO::FETCH_ASSOC) as $item) {
            $share = mhShareForItemName((string) $item['fldItem'], $shareByNormalizedName);
            if ($share === null) {
                continue;
            }
            $kdtShareByItemId[(string) (int) $item['fldID']] = $share;
        }
    }

    $cache = [
        'mngProjID' => $mngProjID,
        'solProjID' => $solProjID,
        'leaveID' => $leaveID,
        'defaultProjectIds' => $defaultProjectIds,
        'allDefaultProjectIds' => $defaultIds,
        'noCounterpartBU' => $noCounterpartBU,
        'kdtShareByItemId' => $kdtShareByItemId,
    ];

    return $cache;
}

function mhItemKdtShare(string $itemId, array $kdtShareByItemId): ?int
{
    if ($itemId === '') {
        return null;
    }

    $key = (string) (int) $itemId;
    if (!array_key_exists($key, $kdtShareByItemId)) {
        return null;
    }

    return $kdtShareByItemId[$key];
}

/**
 * Split hours into KDT (K) and BU (B) buckets.
 * Partial shares for groups with no KHI counterpart go 100% to KDT
 * (same rule as the old 50/50 items).
 *
 * @return array<string, float>
 */
function mhSplitHoursByShare(float $hours, int $kdtShare, bool $noCounterpart): array
{
    $share = mhClampShare($kdtShare);

    if ($share > 0 && $share < 100 && $noCounterpart) {
        return ['K' => $hours];
    }

    if ($share >= 100) {
        return ['K' => $hours];
    }

    if ($share <= 0) {
        return ['B' => $hours];
    }

    $kdtHours = $hours * $share / 100;

    return [
        'K' => $kdtHours,
        'B' => $hours - $kdtHours,
    ];
}
