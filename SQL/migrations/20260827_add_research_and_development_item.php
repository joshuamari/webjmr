<?php
/**
 * Migration: Add Research & Development Item of Work
 * under KDT Internal Activities (project ID 2).
 *
 * Usage (CLI):
 *   php SQL/migrations/20260827_add_research_and_development_item.php
 *
 * Usage (browser, local only):
 *   http://localhost/webJMR/SQL/migrations/20260827_add_research_and_development_item.php
 *
 * Safe to run multiple times (idempotent).
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

const KIA_PROJECT_ID = 2;
const RD_ITEM_NAME = 'Research & Development';
const RD_PRIORITY = 0;

try {
    $checkStmt = $connwebjmr->prepare("
        SELECT fldID, fldProject, fldItem, fldGroup, fldActive, fldPriority, fldDelete
        FROM itemofworkstable
        WHERE fldProject = :projectId
          AND fldItem = :itemName
          AND fldDelete = '0'
        LIMIT 1
    ");
    $checkStmt->execute([
        ':projectId' => KIA_PROJECT_ID,
        ':itemName' => RD_ITEM_NAME,
    ]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        migrateOut('SKIPPED: Research & Development item already exists.', $isCli);
        migrateOut(
            sprintf(
                '  fldID=%s | fldProject=%s | fldPriority=%s | fldActive=%s',
                $existing['fldID'],
                $existing['fldProject'],
                $existing['fldPriority'],
                $existing['fldActive']
            ),
            $isCli
        );
        exit(0);
    }

    $projectStmt = $connwebjmr->prepare("
        SELECT fldID, fldProject
        FROM projectstable
        WHERE fldID = :projectId
        LIMIT 1
    ");
    $projectStmt->execute([':projectId' => KIA_PROJECT_ID]);
    $project = $projectStmt->fetch(PDO::FETCH_ASSOC);

    if (!$project) {
        migrateOut('ERROR: KDT Internal Activities project (fldID=2) was not found.', $isCli);
        exit(1);
    }

    $insertStmt = $connwebjmr->prepare("
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
            :priority,
            0
        )
    ");
    $insertStmt->execute([
        ':projectId' => KIA_PROJECT_ID,
        ':itemName' => RD_ITEM_NAME,
        ':priority' => RD_PRIORITY,
    ]);

    $newId = (int) $connwebjmr->lastInsertId();

    migrateOut('SUCCESS: Research & Development item inserted.', $isCli);
    migrateOut(
        sprintf(
            '  fldID=%d | fldProject=%d (%s) | fldPriority=%d | fldGroup=NULL',
            $newId,
            KIA_PROJECT_ID,
            $project['fldProject'],
            RD_PRIORITY
        ),
        $isCli
    );
    migrateOut('NOTE: No JRDs were seeded. Groups will add their own via JMC.', $isCli);
    exit(0);
} catch (Throwable $e) {
    migrateOut('ERROR: Migration failed — ' . $e->getMessage(), $isCli);
    exit(1);
}
