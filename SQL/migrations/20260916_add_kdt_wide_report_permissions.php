<?php
/**
 * Migration: Add KDT Wide Training Report module and permissions.
 *
 * Module (Web JMR):
 *   KDT Wide Training Report
 * Permissions:
 *   Access            (permission_id = 56)
 *   All Group Access  (permission_id = 57)
 *
 * Usage (CLI):
 *   php SQL/migrations/20260916_add_kdt_wide_report_permissions.php
 *
 * Usage (browser, local only):
 *   http://localhost/webJMR/SQL/migrations/20260916_add_kdt_wide_report_permissions.php
 *
 * Safe to run multiple times (idempotent).
 * Does not overwrite permission_id 56 or 57 if those IDs already exist
 * as a different permission.
 */

date_default_timezone_set('Asia/Manila');

require_once __DIR__ . '/../../dbconn/dbconnectkdtph.php';

$isCli = PHP_SAPI === 'cli';

const WEB_JMR_PROJECT_NAME = 'Web JMR';
const KDT_WIDE_REPORT_MODULE_NAME = 'KDT Wide Training Report';
const KDT_WIDE_ACCESS_ID = 56;
const KDT_WIDE_ALL_GROUPS_ID = 57;
const KDT_WIDE_ACCESS_NAME = 'Access';
const KDT_WIDE_ALL_GROUPS_NAME = 'All Group Access';

function migrateOut(string $message, bool $isCli): void
{
    if ($isCli) {
        echo $message . PHP_EOL;
        return;
    }

    echo htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . "<br>\n";
}

function fetchWebJmrProject(PDO $conn): ?array
{
    $stmt = $conn->prepare("
        SELECT project_id, project_name
        FROM kdtwebprojects
        WHERE project_name = :projectName
        LIMIT 1
    ");
    $stmt->execute([':projectName' => WEB_JMR_PROJECT_NAME]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function fetchModule(PDO $conn, int $projectId, string $moduleName): ?array
{
    $stmt = $conn->prepare("
        SELECT module_id, project_id, module_name
        FROM kdtproject_modules
        WHERE project_id = :projectId
          AND module_name = :moduleName
        LIMIT 1
    ");
    $stmt->execute([
        ':projectId' => $projectId,
        ':moduleName' => $moduleName,
    ]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function insertModule(PDO $conn, int $projectId, string $moduleName): int
{
    $stmt = $conn->prepare("
        INSERT INTO kdtproject_modules (project_id, module_name)
        VALUES (:projectId, :moduleName)
    ");
    $stmt->execute([
        ':projectId' => $projectId,
        ':moduleName' => $moduleName,
    ]);

    return (int) $conn->lastInsertId();
}

function fetchPermissionById(PDO $conn, int $permissionId): ?array
{
    $stmt = $conn->prepare("
        SELECT permission_id, module_id, permission_name, permission_desc
        FROM p_permissions
        WHERE permission_id = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $permissionId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function fetchPermissionByName(PDO $conn, int $moduleId, string $permissionName): ?array
{
    $stmt = $conn->prepare("
        SELECT permission_id, module_id, permission_name, permission_desc
        FROM p_permissions
        WHERE module_id = :moduleId
          AND permission_name = :permissionName
        LIMIT 1
    ");
    $stmt->execute([
        ':moduleId' => $moduleId,
        ':permissionName' => $permissionName,
    ]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function insertPermission(
    PDO $conn,
    int $permissionId,
    int $moduleId,
    string $permissionName,
    string $permissionDesc
): void {
    $stmt = $conn->prepare("
        INSERT INTO p_permissions (
            permission_id,
            module_id,
            permission_name,
            permission_desc
        ) VALUES (
            :permissionId,
            :moduleId,
            :permissionName,
            :permissionDesc
        )
    ");
    $stmt->execute([
        ':permissionId' => $permissionId,
        ':moduleId' => $moduleId,
        ':permissionName' => $permissionName,
        ':permissionDesc' => $permissionDesc,
    ]);
}

/**
 * @return 'inserted'|'skipped'
 */
function ensurePermission(
    PDO $conn,
    int $permissionId,
    int $moduleId,
    string $permissionName,
    string $permissionDesc,
    bool $isCli
): string {
    $byId = fetchPermissionById($conn, $permissionId);
    $byName = fetchPermissionByName($conn, $moduleId, $permissionName);

    if ($byId) {
        $sameModule = (int) $byId['module_id'] === $moduleId;
        $sameName = $byId['permission_name'] === $permissionName;
        if (!$sameModule || !$sameName) {
            throw new RuntimeException(sprintf(
                'permission_id=%d already exists as "%s" (module_id=%d). Expected "%s" under module_id=%d.',
                $permissionId,
                $byId['permission_name'],
                (int) $byId['module_id'],
                $permissionName,
                $moduleId
            ));
        }
        migrateOut(
            sprintf(
                'SKIPPED: %s already exists (permission_id=%d, module_id=%d).',
                $permissionName,
                $permissionId,
                $moduleId
            ),
            $isCli
        );
        return 'skipped';
    }

    if ($byName) {
        if ((int) $byName['permission_id'] !== $permissionId) {
            throw new RuntimeException(sprintf(
                '"%s" already exists on this module as permission_id=%d. Expected permission_id=%d.',
                $permissionName,
                (int) $byName['permission_id'],
                $permissionId
            ));
        }
        migrateOut(
            sprintf(
                'SKIPPED: %s already exists (permission_id=%d, module_id=%d).',
                $permissionName,
                $permissionId,
                $moduleId
            ),
            $isCli
        );
        return 'skipped';
    }

    insertPermission($conn, $permissionId, $moduleId, $permissionName, $permissionDesc);
    migrateOut(
        sprintf(
            'SUCCESS: %s inserted (permission_id=%d, module_id=%d).',
            $permissionName,
            $permissionId,
            $moduleId
        ),
        $isCli
    );

    return 'inserted';
}

if (!isset($connkdt) || !($connkdt instanceof PDO)) {
    migrateOut('ERROR: Database connection failed.', $isCli);
    exit(1);
}

try {
    $connkdt->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $connkdt->beginTransaction();

    $project = fetchWebJmrProject($connkdt);
    if ($project === null) {
        $connkdt->rollBack();
        migrateOut('ERROR: Web JMR project was not found in kdtwebprojects.', $isCli);
        exit(1);
    }

    $projectId = (int) $project['project_id'];
    $module = fetchModule($connkdt, $projectId, KDT_WIDE_REPORT_MODULE_NAME);

    if ($module) {
        $moduleId = (int) $module['module_id'];
        migrateOut('SKIPPED: KDT Wide Training Report module already exists.', $isCli);
        migrateOut(
            sprintf('  module_id=%d | project_id=%d (%s)', $moduleId, $projectId, $project['project_name']),
            $isCli
        );
    } else {
        $moduleId = insertModule($connkdt, $projectId, KDT_WIDE_REPORT_MODULE_NAME);
        migrateOut('SUCCESS: KDT Wide Training Report module inserted.', $isCli);
        migrateOut(
            sprintf('  module_id=%d | project_id=%d (%s)', $moduleId, $projectId, $project['project_name']),
            $isCli
        );
    }

    ensurePermission(
        $connkdt,
        KDT_WIDE_ACCESS_ID,
        $moduleId,
        KDT_WIDE_ACCESS_NAME,
        'Access to KDT Wide Training Report',
        $isCli
    );
    ensurePermission(
        $connkdt,
        KDT_WIDE_ALL_GROUPS_ID,
        $moduleId,
        KDT_WIDE_ALL_GROUPS_NAME,
        'All Group Access for KDT Wide Training Report',
        $isCli
    );

    $connkdt->commit();
    exit(0);
} catch (Throwable $e) {
    if ($connkdt instanceof PDO && $connkdt->inTransaction()) {
        $connkdt->rollBack();
    }
    migrateOut('ERROR: Migration failed — ' . $e->getMessage(), $isCli);
    exit(1);
}
