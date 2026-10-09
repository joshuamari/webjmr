<?php
/**
 * Migration: Add Special Leave item of work under the Leave project.
 *
 * Usage (CLI):
 *   php SQL/migrations/20261008_add_special_leave.php
 *
 * Usage (browser, local only):
 *   http://localhost/webJMR/SQL/migrations/20261008_add_special_leave.php
 *
 * Safe to run multiple times (idempotent).
 * Looks up Leave by project name so fldID can differ per environment.
 * No JRD is seeded. Leave entries do not require a job request.
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

const SPECIAL_LEAVE_ITEM = 'Special Leave';
const SPECIAL_LEAVE_PRIORITY = 0;

try {
    $projectStmt = $connwebjmr->prepare("
        SELECT fldID, fldProject
        FROM projectstable
        WHERE fldProject = 'Leave'
          AND fldDelete = 0
        LIMIT 1
    ");
    $projectStmt->execute();
    $project = $projectStmt->fetch(PDO::FETCH_ASSOC);

    if (!$project) {
        migrateOut('ERROR: Leave project was not found.', $isCli);
        exit(1);
    }

    $leaveProjectId = (int) $project['fldID'];

    $checkStmt = $connwebjmr->prepare("
        SELECT fldID, fldProject, fldItem, fldGroup, fldActive, fldPriority, fldDelete
        FROM itemofworkstable
        WHERE fldProject = :projectId
          AND fldItem = :itemName
          AND fldDelete = '0'
        LIMIT 1
    ");
    $checkStmt->execute([
        ':projectId' => $leaveProjectId,
        ':itemName' => SPECIAL_LEAVE_ITEM,
    ]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        migrateOut('SKIPPED: Special Leave item already exists.', $isCli);
        migrateOut(
            sprintf(
                '  fldID=%s | fldProject=%s | fldPriority=%s | fldActive=%s | fldGroup=%s',
                $existing['fldID'],
                $existing['fldProject'],
                $existing['fldPriority'],
                $existing['fldActive'],
                $existing['fldGroup'] === null ? 'NULL' : $existing['fldGroup']
            ),
            $isCli
        );
        exit(0);
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
        ':projectId' => $leaveProjectId,
        ':itemName' => SPECIAL_LEAVE_ITEM,
        ':priority' => SPECIAL_LEAVE_PRIORITY,
    ]);

    $newId = (int) $connwebjmr->lastInsertId();

    migrateOut('SUCCESS: Special Leave item inserted.', $isCli);
    migrateOut(
        sprintf(
            '  fldID=%d | fldProject=%d (%s) | fldPriority=%d | fldGroup=NULL',
            $newId,
            $leaveProjectId,
            $project['fldProject'],
            SPECIAL_LEAVE_PRIORITY
        ),
        $isCli
    );
    migrateOut('NOTE: No JRD was seeded. Leave entries do not require a job request.', $isCli);
    migrateOut(
        'NOTE: Add this fldID to oLeaves in Monthly Standard if those hours should appear under EL, PL, ML, Others.',
        $isCli
    );
    exit(0);
} catch (Throwable $e) {
    migrateOut('ERROR: Migration failed — ' . $e->getMessage(), $isCli);
    exit(1);
}
