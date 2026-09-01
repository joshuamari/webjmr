<?php
/**
 * Migration: Copy MH Report permissions to R&D Manhour Report.
 *
 *   MH Access (3)        -> R&D Access (54)
 *   MH All group (51)    -> R&D All Group Access (55)
 *
 * Usage (CLI):
 *   php SQL/migrations/20260901_copy_mh_report_permissions_to_rd_report.php
 *
 * Usage (browser, local only):
 *   http://localhost/webJMR/SQL/migrations/20260901_copy_mh_report_permissions_to_rd_report.php
 *
 * Safe to run multiple times (idempotent). Existing R&D grants are kept.
 */

date_default_timezone_set('Asia/Manila');

require_once __DIR__ . '/../../dbconn/dbconnectkdtph.php';

$isCli = PHP_SAPI === 'cli';

function migrateOut(string $message, bool $isCli): void
{
    if ($isCli) {
        echo $message . PHP_EOL;
        return;
    }

    echo htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . "<br>\n";
}

if (!isset($connkdt) || !($connkdt instanceof PDO)) {
    migrateOut('ERROR: Database connection failed.', $isCli);
    exit(1);
}

const MH_ACCESS = 3;
const MH_ALL_GROUPS = 51;
const RD_ACCESS = 54;
const RD_ALL_GROUPS = 55;

/**
 * @return array{permission_id: int, permission_name: string}|null
 */
function fetchPermission(PDO $conn, int $permissionId): ?array
{
    $stmt = $conn->prepare(
        'SELECT permission_id, permission_name
         FROM p_permissions
         WHERE permission_id = :id
         LIMIT 1'
    );
    $stmt->execute([':id' => $permissionId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function countGrants(PDO $conn, int $permissionId): int
{
    $stmt = $conn->prepare(
        'SELECT COUNT(*) FROM user_permissions WHERE permission_id = :id'
    );
    $stmt->execute([':id' => $permissionId]);

    return (int) $stmt->fetchColumn();
}

function copyPermission(PDO $conn, int $sourceId, int $targetId): int
{
    $stmt = $conn->prepare(
        'INSERT INTO user_permissions (permission_id, fldEmployeeNum)
         SELECT :targetId, src.fldEmployeeNum
         FROM user_permissions AS src
         WHERE src.permission_id = :sourceId
           AND NOT EXISTS (
               SELECT 1
               FROM user_permissions AS existing
               WHERE existing.permission_id = :targetIdExists
                 AND existing.fldEmployeeNum = src.fldEmployeeNum
           )'
    );
    $stmt->execute([
        ':targetId' => $targetId,
        ':sourceId' => $sourceId,
        ':targetIdExists' => $targetId,
    ]);

    return $stmt->rowCount();
}

try {
    $connkdt->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $required = [
        MH_ACCESS => 'MH Report Access',
        MH_ALL_GROUPS => 'MH Report All group access',
        RD_ACCESS => 'R&D Report Access',
        RD_ALL_GROUPS => 'R&D Report All Group Access',
    ];

    foreach ($required as $permissionId => $label) {
        $row = fetchPermission($connkdt, $permissionId);
        if ($row === null) {
            migrateOut(
                sprintf('ERROR: %s (permission_id=%d) was not found in p_permissions.', $label, $permissionId),
                $isCli
            );
            exit(1);
        }
        migrateOut(
            sprintf('OK: %s (permission_id=%d, name=%s)', $label, $permissionId, $row['permission_name']),
            $isCli
        );
    }

    $beforeAccess = countGrants($connkdt, RD_ACCESS);
    $beforeAll = countGrants($connkdt, RD_ALL_GROUPS);

    $insertedAccess = copyPermission($connkdt, MH_ACCESS, RD_ACCESS);
    $insertedAll = copyPermission($connkdt, MH_ALL_GROUPS, RD_ALL_GROUPS);

    migrateOut('SUCCESS: MH Report permissions copied to R&D Report.', $isCli);
    migrateOut(
        sprintf(
            '  Access 3 -> 54: inserted %d (now %d users; was %d)',
            $insertedAccess,
            countGrants($connkdt, RD_ACCESS),
            $beforeAccess
        ),
        $isCli
    );
    migrateOut(
        sprintf(
            '  All groups 51 -> 55: inserted %d (now %d users; was %d)',
            $insertedAll,
            countGrants($connkdt, RD_ALL_GROUPS),
            $beforeAll
        ),
        $isCli
    );
    exit(0);
} catch (Throwable $e) {
    migrateOut('ERROR: Migration failed — ' . $e->getMessage(), $isCli);
    exit(1);
}
