<?php
/**
 * Migration: Drop billing-percent suffixes from Training item names.
 *
 * Canonical names (share lives in MH Report PHP map, not in the label):
 *   Trainer for One BU Participants
 *   Trainer for Multiple BU Participants
 *   Training for New Employee (3 Months)
 *
 * Usage (CLI):
 *   php SQL/migrations/20260901_rename_trainer_for_one_bu.php
 *
 * Usage (browser, local only):
 *   http://localhost/webJMR/SQL/migrations/20260901_rename_trainer_for_one_bu.php
 *
 * Safe to run multiple times (idempotent). Does not change fldID or dailyreport rows.
 */

date_default_timezone_set('Asia/Manila');

require_once __DIR__ . '/../../dbconn/dbconnectwebjmr.php';

$isCli = PHP_SAPI === 'cli';

function migrateOut(string $message, bool $isCli): void
{
    if ($isCli) {
        echo $message . PHP_EOL;
        return;
    }

    echo htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . "<br>\n";
}

if (!isset($connwebjmr) || !($connwebjmr instanceof PDO)) {
    migrateOut('ERROR: Database connection failed.', $isCli);
    exit(1);
}

const TRAINING_ITEM_RENAMES = [
    [
        'canonical' => 'Trainer for One BU Participants',
        'oldExact' => 'Trainer for One BU Participants- [100% KHI]',
    ],
    [
        'canonical' => 'Trainer for Multiple BU Participants',
        'oldExact' => 'Trainer for Multiple BU Participants- [50% KDT]',
    ],
    [
        'canonical' => 'Training for New Employee (3 Months)',
        'oldExact' => 'Training for New Employee (3 Months)- [50% KDT]',
    ],
];

/**
 * @return array{status: string, message: string}
 */
function renameTrainingItem(PDO $conn, array $spec): array
{
    $canonical = $spec['canonical'];
    $oldExact = $spec['oldExact'];

    $listStmt = $conn->prepare("
        SELECT i.fldID, i.fldItem, i.fldProject, p.fldProject AS projName
        FROM itemofworkstable AS i
        JOIN projectstable AS p ON p.fldID = i.fldProject
        WHERE p.fldProject = 'Training'
          AND i.fldDelete = '0'
          AND (
            i.fldItem = :canonical
            OR i.fldItem = :oldExact
            OR i.fldItem LIKE :prefix
          )
        ORDER BY i.fldID
    ");
    $listStmt->execute([
        ':canonical' => $canonical,
        ':oldExact' => $oldExact,
        ':prefix' => $canonical . '%',
    ]);
    $rows = $listStmt->fetchAll(PDO::FETCH_ASSOC);

    $canonicalRow = null;
    $toRename = [];
    foreach ($rows as $row) {
        if ($row['fldItem'] === $canonical) {
            $canonicalRow = $row;
            continue;
        }
        $toRename[] = $row;
    }

    if ($canonicalRow && empty($toRename)) {
        return [
            'status' => 'skipped',
            'message' => sprintf(
                'SKIPPED: "%s" already canonical (fldID=%s)',
                $canonical,
                $canonicalRow['fldID']
            ),
        ];
    }

    if ($canonicalRow && !empty($toRename)) {
        $extras = array_map(
            static function ($row) {
                return sprintf('fldID=%s [%s]', $row['fldID'], $row['fldItem']);
            },
            $toRename
        );

        return [
            'status' => 'error',
            'message' => sprintf(
                'ERROR: Both canonical and old names exist for "%s". %s',
                $canonical,
                implode('; ', $extras)
            ),
        ];
    }

    if (!$canonicalRow && empty($toRename)) {
        return [
            'status' => 'error',
            'message' => sprintf(
                'ERROR: "%s" was not found under Training.',
                $canonical
            ),
        ];
    }

    if (count($toRename) !== 1) {
        $extras = array_map(
            static function ($row) {
                return sprintf('fldID=%s [%s]', $row['fldID'], $row['fldItem']);
            },
            $toRename
        );

        return [
            'status' => 'error',
            'message' => sprintf(
                'ERROR: Expected one old-named row for "%s", found %d. %s',
                $canonical,
                count($toRename),
                implode('; ', $extras)
            ),
        ];
    }

    $old = $toRename[0];
    $updateStmt = $conn->prepare("
        UPDATE itemofworkstable
        SET fldItem = :newName
        WHERE fldID = :id
          AND fldDelete = '0'
        LIMIT 1
    ");
    $updateStmt->execute([
        ':newName' => $canonical,
        ':id' => $old['fldID'],
    ]);

    return [
        'status' => 'success',
        'message' => sprintf(
            'SUCCESS: fldID=%s | %s -> %s',
            $old['fldID'],
            $old['fldItem'],
            $canonical
        ),
    ];
}

try {
    $hadError = false;

    foreach (TRAINING_ITEM_RENAMES as $spec) {
        $result = renameTrainingItem($connwebjmr, $spec);
        migrateOut($result['message'], $isCli);
        if ($result['status'] === 'error') {
            $hadError = true;
        }
    }

    if ($hadError) {
        migrateOut('NOTE: Some items failed. Fix those rows and re-run (already-renamed items will skip).', $isCli);
        exit(1);
    }

    migrateOut('NOTE: dailyreport rows keep the same fldItem ID. No JRD changes.', $isCli);
    exit(0);
} catch (Throwable $e) {
    migrateOut('ERROR: Migration failed — ' . $e->getMessage(), $isCli);
    exit(1);
}
