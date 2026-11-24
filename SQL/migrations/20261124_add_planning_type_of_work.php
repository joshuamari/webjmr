<?php
/**
 * Migration: Add Planning type of work.
 *
 * Usage (CLI):
 *   php SQL/migrations/20261124_add_planning_type_of_work.php
 *
 * Usage (browser, local only):
 *   http://localhost/webJMR/SQL/migrations/20261124_add_planning_type_of_work.php
 *
 * Safe to run multiple times (idempotent).
 * fldTOWType = 1 so it appears for normal projects, not Leave.
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

const PLANNING_TOW = 'Planning';
const PLANNING_CODE = 'Plan';
const PLANNING_TYPE = 1;
const PLANNING_DESC = 'Planning';
const PLANNING_PRIORITY = 0;

try {
    $checkStmt = $connwebjmr->prepare("
        SELECT fldID, fldCode, fldTOW, fldTOWType, fldTOWDesc, fldActive, fldPrio
        FROM typesofworktable
        WHERE fldTOW = :towName
          AND fldTOWType = :towType
        LIMIT 1
    ");
    $checkStmt->execute([
        ':towName' => PLANNING_TOW,
        ':towType' => PLANNING_TYPE,
    ]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        migrateOut('SKIPPED: Planning type of work already exists.', $isCli);
        migrateOut(
            sprintf(
                '  fldID=%s | fldCode=%s | fldTOW=%s | fldTOWType=%s | fldActive=%s | fldPrio=%s',
                $existing['fldID'],
                $existing['fldCode'],
                $existing['fldTOW'],
                $existing['fldTOWType'],
                $existing['fldActive'],
                $existing['fldPrio']
            ),
            $isCli
        );
        exit(0);
    }

    $insertStmt = $connwebjmr->prepare("
        INSERT INTO typesofworktable (
            fldTOW,
            fldCode,
            fldTOWType,
            fldTOWDesc,
            fldActive,
            fldPrio
        ) VALUES (
            :towName,
            :towCode,
            :towType,
            :towDesc,
            1,
            :priority
        )
    ");
    $insertStmt->execute([
        ':towName' => PLANNING_TOW,
        ':towCode' => PLANNING_CODE,
        ':towType' => PLANNING_TYPE,
        ':towDesc' => PLANNING_DESC,
        ':priority' => PLANNING_PRIORITY,
    ]);

    $newId = (int) $connwebjmr->lastInsertId();

    migrateOut('SUCCESS: Planning type of work inserted.', $isCli);
    migrateOut(
        sprintf(
            '  fldID=%d | fldCode=%s | fldTOW=%s | fldTOWType=%d | fldPrio=%d',
            $newId,
            PLANNING_CODE,
            PLANNING_TOW,
            PLANNING_TYPE,
            PLANNING_PRIORITY
        ),
        $isCli
    );
    exit(0);
} catch (Throwable $e) {
    migrateOut('ERROR: Migration failed — ' . $e->getMessage(), $isCli);
    exit(1);
}
