<?php
/**
 * Migration: Add "KDT Wide Training" item of work under Training,
 * with two item-scoped JRDs.
 *
 * Canonical names:
 *   Item: KDT Wide Training
 *   JRD:  People management training program
 *   JRD:  Work Evolution Guidance
 *
 * 100% KDT billing is configured in MH Report PHP, not in these labels.
 *
 * Usage (CLI):
 *   php SQL/migrations/20260916_add_kdt_wide_training.php
 *
 * Usage (browser, local only):
 *   http://localhost/webJMR/SQL/migrations/20260916_add_kdt_wide_training.php
 *
 * Safe to run multiple times (idempotent).
 * Does not change existing fldID values. Does not run resetDB.php.
 */

date_default_timezone_set('Asia/Manila');

require_once __DIR__ . '/../../dbconn/dbconnectwebjmr.php';

$isCli = PHP_SAPI === 'cli';

const TRAIN_PROJECT_NAME = 'Training';
const KDT_WIDE_ITEM_NAME = 'KDT Wide Training';
const KDT_WIDE_JRDS = [
    ['name' => 'People management training program', 'priority' => 1],
    ['name' => 'Work Evolution Guidance', 'priority' => 2],
];

function migrateOut(string $message, bool $isCli): void
{
    if ($isCli) {
        echo $message . PHP_EOL;
        return;
    }

    echo htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . "<br>\n";
}

function fetchTrainingProject(PDO $conn): ?array
{
    $stmt = $conn->prepare("
        SELECT fldID, fldProject
        FROM projectstable
        WHERE fldProject = :projectName
        LIMIT 1
    ");
    $stmt->execute([':projectName' => TRAIN_PROJECT_NAME]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function fetchKdtWideItem(PDO $conn, int $projectId): ?array
{
    $stmt = $conn->prepare("
        SELECT fldID, fldProject, fldItem, fldGroup, fldActive, fldPriority, fldDelete
        FROM itemofworkstable
        WHERE fldProject = :projectId
          AND fldItem = :itemName
          AND fldDelete = '0'
        LIMIT 1
    ");
    $stmt->execute([
        ':projectId' => $projectId,
        ':itemName' => KDT_WIDE_ITEM_NAME,
    ]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function insertKdtWideItem(PDO $conn, int $projectId): int
{
    $stmt = $conn->prepare("
        INSERT INTO itemofworkstable (
            fldProject,
            fldItem,
            fldGroup,
            fldActive,
            fldPriority,
            fldDelete
        ) VALUES (
            :projectId,
            :itemName,
            NULL,
            1,
            0,
            0
        )
    ");
    $stmt->execute([
        ':projectId' => $projectId,
        ':itemName' => KDT_WIDE_ITEM_NAME,
    ]);

    return (int) $conn->lastInsertId();
}

function fetchTrainingJrd(PDO $conn, int $projectId, string $jobName): ?array
{
    $stmt = $conn->prepare("
        SELECT fldID, fldProject, fldItem, fldJob, fldGroup, fldActive, fldPriority, fldDelete
        FROM drawingreference
        WHERE fldProject = :projectId
          AND fldJob = :jobName
          AND fldDelete = '0'
        LIMIT 1
    ");
    $stmt->execute([
        ':projectId' => $projectId,
        ':jobName' => $jobName,
    ]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function insertTrainingJrd(PDO $conn, int $projectId, int $itemId, string $jobName, int $priority): int
{
    $stmt = $conn->prepare("
        INSERT INTO drawingreference (
            fldProject,
            fldItem,
            fldJob,
            fldGroup,
            fldExpectedMH,
            fldActive,
            fldPriority,
            fldDelete
        ) VALUES (
            :projectId,
            :itemId,
            :jobName,
            NULL,
            0,
            1,
            :priority,
            0
        )
    ");
    $stmt->execute([
        ':projectId' => $projectId,
        ':itemId' => $itemId,
        ':jobName' => $jobName,
        ':priority' => $priority,
    ]);

    return (int) $conn->lastInsertId();
}

if (!isset($connwebjmr) || !($connwebjmr instanceof PDO)) {
    migrateOut('ERROR: Database connection failed.', $isCli);
    exit(1);
}

try {
    $connwebjmr->beginTransaction();

    $project = fetchTrainingProject($connwebjmr);
    if ($project === null) {
        $connwebjmr->rollBack();
        migrateOut('ERROR: Training project was not found.', $isCli);
        exit(1);
    }

    $projectId = (int) $project['fldID'];
    $item = fetchKdtWideItem($connwebjmr, $projectId);

    if ($item) {
        $itemId = (int) $item['fldID'];
        migrateOut('SKIPPED: KDT Wide Training item already exists.', $isCli);
        migrateOut(
            sprintf(
                '  fldID=%d | fldProject=%d (%s) | fldActive=%s | fldGroup=NULL',
                $itemId,
                $projectId,
                $project['fldProject'],
                $item['fldActive']
            ),
            $isCli
        );
    } else {
        $itemId = insertKdtWideItem($connwebjmr, $projectId);
        migrateOut('SUCCESS: KDT Wide Training item inserted.', $isCli);
        migrateOut(
            sprintf(
                '  fldID=%d | fldProject=%d (%s) | fldPriority=0 | fldGroup=NULL',
                $itemId,
                $projectId,
                $project['fldProject']
            ),
            $isCli
        );
    }

    foreach (KDT_WIDE_JRDS as $jrd) {
        $existing = fetchTrainingJrd($connwebjmr, $projectId, $jrd['name']);
        if ($existing) {
            $linkedItemId = $existing['fldItem'] === null || $existing['fldItem'] === ''
                ? 'NULL'
                : (string) (int) $existing['fldItem'];
            migrateOut(
                sprintf('SKIPPED: JRD "%s" already exists.', $jrd['name']),
                $isCli
            );
            migrateOut(
                sprintf(
                    '  fldID=%s | fldItem=%s | fldGroup=%s | fldActive=%s',
                    $existing['fldID'],
                    $linkedItemId,
                    $existing['fldGroup'] === null || $existing['fldGroup'] === '' ? 'NULL' : $existing['fldGroup'],
                    $existing['fldActive']
                ),
                $isCli
            );
            if ((int) $existing['fldItem'] !== $itemId) {
                migrateOut(
                    sprintf(
                        '  NOTE: existing JRD is not linked to KDT Wide Training (expected fldItem=%d).',
                        $itemId
                    ),
                    $isCli
                );
            }
            continue;
        }

        $jrdId = insertTrainingJrd(
            $connwebjmr,
            $projectId,
            $itemId,
            $jrd['name'],
            $jrd['priority']
        );
        migrateOut(sprintf('SUCCESS: JRD "%s" inserted.', $jrd['name']), $isCli);
        migrateOut(
            sprintf(
                '  fldID=%d | fldItem=%d | fldPriority=%d | fldGroup=NULL',
                $jrdId,
                $itemId,
                $jrd['priority']
            ),
            $isCli
        );
    }

    $connwebjmr->commit();
    migrateOut('NOTE: MH Report bills this item at 100% KDT via mh_billing.php.', $isCli);
    exit(0);
} catch (Throwable $e) {
    if ($connwebjmr->inTransaction()) {
        $connwebjmr->rollBack();
    }
    migrateOut('ERROR: Migration failed — ' . $e->getMessage(), $isCli);
    exit(1);
}
