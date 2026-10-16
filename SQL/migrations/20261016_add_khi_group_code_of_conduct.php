<?php
/**
 * Migration: Add "KHI Group Code of Conduct" JRD under KDT Wide Training.
 *
 * Canonical names:
 *   Item: KDT Wide Training
 *   JRD:  KHI Group Code of Conduct
 *
 * Company-wide (fldGroup NULL), same as the other KDT Wide activities.
 * 100% KDT billing stays on the item in MH Report PHP.
 *
 * Usage (CLI):
 *   php SQL/migrations/20261016_add_khi_group_code_of_conduct.php
 *
 * Usage (browser, local only):
 *   http://localhost/webJMR/SQL/migrations/20261016_add_khi_group_code_of_conduct.php
 *
 * Safe to run multiple times (idempotent).
 * Does not change existing fldID values. Does not run resetDB.php.
 */

date_default_timezone_set('Asia/Manila');

require_once __DIR__ . '/../../dbconn/dbconnectwebjmr.php';

$isCli = PHP_SAPI === 'cli';

const TRAIN_PROJECT_NAME = 'Training';
const KDT_WIDE_ITEM_NAME = 'KDT Wide Training';
const JRD_NAME = 'KHI Group Code of Conduct';

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

try {
    $connwebjmr->beginTransaction();

    $projectStmt = $connwebjmr->prepare("
        SELECT fldID, fldProject
        FROM projectstable
        WHERE fldProject = :projectName
        LIMIT 1
    ");
    $projectStmt->execute([':projectName' => TRAIN_PROJECT_NAME]);
    $project = $projectStmt->fetch(PDO::FETCH_ASSOC);

    if (!$project) {
        $connwebjmr->rollBack();
        migrateOut('ERROR: Training project was not found.', $isCli);
        exit(1);
    }

    $projectId = (int) $project['fldID'];

    $itemStmt = $connwebjmr->prepare("
        SELECT fldID, fldItem, fldActive
        FROM itemofworkstable
        WHERE fldProject = :projectId
          AND fldItem = :itemName
          AND fldDelete = '0'
        LIMIT 1
    ");
    $itemStmt->execute([
        ':projectId' => $projectId,
        ':itemName' => KDT_WIDE_ITEM_NAME,
    ]);
    $item = $itemStmt->fetch(PDO::FETCH_ASSOC);

    if (!$item) {
        $connwebjmr->rollBack();
        migrateOut('ERROR: KDT Wide Training item was not found. Run 20260916_add_kdt_wide_training.php first.', $isCli);
        exit(1);
    }

    $itemId = (int) $item['fldID'];

    $existingStmt = $connwebjmr->prepare("
        SELECT fldID, fldItem, fldJob, fldGroup, fldActive, fldPriority, fldDelete
        FROM drawingreference
        WHERE fldProject = :projectId
          AND fldJob = :jobName
          AND fldDelete = '0'
        LIMIT 1
    ");
    $existingStmt->execute([
        ':projectId' => $projectId,
        ':jobName' => JRD_NAME,
    ]);
    $existing = $existingStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $linkedItemId = $existing['fldItem'] === null || $existing['fldItem'] === ''
            ? 'NULL'
            : (string) (int) $existing['fldItem'];
        migrateOut('SKIPPED: JRD "' . JRD_NAME . '" already exists.', $isCli);
        migrateOut(
            sprintf(
                '  fldID=%s | fldItem=%s | fldGroup=%s | fldActive=%s | fldPriority=%s',
                $existing['fldID'],
                $linkedItemId,
                $existing['fldGroup'] === null || $existing['fldGroup'] === '' ? 'NULL' : $existing['fldGroup'],
                $existing['fldActive'],
                $existing['fldPriority']
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
        $connwebjmr->commit();
        exit(0);
    }

    $priorityStmt = $connwebjmr->prepare("
        SELECT IFNULL(MAX(fldPriority), 0) + 1
        FROM drawingreference
        WHERE fldProject = :projectId
          AND fldItem = :itemId
          AND fldDelete = '0'
    ");
    $priorityStmt->execute([
        ':projectId' => $projectId,
        ':itemId' => $itemId,
    ]);
    $priority = (int) $priorityStmt->fetchColumn();

    $insertStmt = $connwebjmr->prepare("
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
    $insertStmt->execute([
        ':projectId' => $projectId,
        ':itemId' => $itemId,
        ':jobName' => JRD_NAME,
        ':priority' => $priority,
    ]);

    $jrdId = (int) $connwebjmr->lastInsertId();
    $connwebjmr->commit();

    migrateOut('SUCCESS: JRD "' . JRD_NAME . '" inserted.', $isCli);
    migrateOut(
        sprintf(
            '  fldID=%d | fldItem=%d (%s) | fldPriority=%d | fldGroup=NULL',
            $jrdId,
            $itemId,
            KDT_WIDE_ITEM_NAME,
            $priority
        ),
        $isCli
    );
    migrateOut('NOTE: Hours bill 100% KDT with the rest of KDT Wide Training via mh_billing.php.', $isCli);
    exit(0);
} catch (Throwable $e) {
    if ($connwebjmr->inTransaction()) {
        $connwebjmr->rollBack();
    }
    migrateOut('ERROR: Migration failed — ' . $e->getMessage(), $isCli);
    exit(1);
}
