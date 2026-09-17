<?php

/**
 * R&D Manhour Report bootstrap: connections, JSON errors, no leaked SQL details.
 */

date_default_timezone_set('Asia/Manila');

const RD_ALL_GROUPS = '__all__';
const RD_ACCESS_PERMISSION = 54;
const RD_ALL_GROUP_ACCESS = 55;
const KDTWIDE_ACCESS_PERMISSION = 56;
const KDTWIDE_ALL_GROUP_ACCESS = 57;
const RD_REPORT_TYPE_RD = 'rd';
const RD_REPORT_TYPE_KDTWIDE = 'kdtwide';

function rdAccessPermissionId(string $type): int
{
    return $type === RD_REPORT_TYPE_KDTWIDE
        ? KDTWIDE_ACCESS_PERMISSION
        : RD_ACCESS_PERMISSION;
}

function rdAllGroupAccessPermissionId(string $type): int
{
    return $type === RD_REPORT_TYPE_KDTWIDE
        ? KDTWIDE_ALL_GROUP_ACCESS
        : RD_ALL_GROUP_ACCESS;
}

function rdHasAccess($employeeId, ?string $type = null): bool
{
    $type = $type ?? rdRequestedType();

    return checkAccess(rdAccessPermissionId($type), $employeeId);
}

function rdPublicErrorMessage(Throwable $e): string
{
    if ($e instanceof PDOException) {
        return 'Database connection failed.';
    }

    return 'Could not load R&D Manhour Report data.';
}

function rdJsonHeaders(): void
{
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
    }
}

function rdJsonFail(?Throwable $e = null, string $message = ''): void
{
    if ($e instanceof Throwable) {
        error_log('R&D Manhour Report: ' . $e->getMessage());
        if ($message === '') {
            $message = rdPublicErrorMessage($e);
        }
    } elseif ($message === '') {
        $message = 'Could not load R&D Manhour Report data.';
    }

    if (!headers_sent()) {
        http_response_code(500);
    }
    rdJsonHeaders();
    echo json_encode([
        'isSuccess' => false,
        'message' => $message,
    ]);
    exit(1);
}

function rdJsonOk(array $payload): void
{
    rdJsonHeaders();
    echo json_encode($payload);
    exit(0);
}

function rdRequireConnections(): void
{
    global $connkdt, $connnew, $connwebjmr;

    ob_start();
    require_once __DIR__ . '/../../../dbconn/dbconnectkdtph.php';
    require_once __DIR__ . '/../../../dbconn/dbconnectnew.php';
    require_once __DIR__ . '/../../../dbconn/dbconnectwebjmr.php';
    ob_end_clean();

    require_once __DIR__ . '/../../../global/globalFunctions.php';

    if (
        !($connkdt instanceof PDO) ||
        !($connnew instanceof PDO) ||
        !($connwebjmr instanceof PDO)
    ) {
        rdJsonFail(null, 'Database connection failed.');
    }

    $connkdt->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $connnew->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $connwebjmr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}

function rdRequestedType(): string
{
    $raw = '';
    if (isset($_POST['reportType'])) {
        $raw = trim((string) $_POST['reportType']);
    } elseif (isset($_GET['reportType'])) {
        $raw = trim((string) $_GET['reportType']);
    }

    if ($raw === RD_REPORT_TYPE_KDTWIDE) {
        return RD_REPORT_TYPE_KDTWIDE;
    }

    return RD_REPORT_TYPE_RD;
}

function rdLookupItemId(PDO $conn, string $projectName, string $itemName): int
{
    $stmt = $conn->prepare(
        "SELECT i.fldID
         FROM itemofworkstable AS i
         JOIN projectstable AS p ON p.fldID = i.fldProject
         WHERE p.fldProject = :projectName
           AND i.fldItem = :itemName
           AND i.fldDelete = '0'
         LIMIT 1"
    );
    $stmt->execute([
        ':projectName' => $projectName,
        ':itemName' => $itemName,
    ]);
    $value = $stmt->fetchColumn();

    return $value !== false ? (int) $value : 0;
}

function rdItemId(PDO $conn): int
{
    return rdLookupItemId($conn, 'KDT Internal Activities', 'Research & Development');
}

function rdKdtWideItemId(PDO $conn): int
{
    return rdLookupItemId($conn, 'Training', 'KDT Wide Training');
}

function rdItemIdForType(PDO $conn, string $type): int
{
    if ($type === RD_REPORT_TYPE_KDTWIDE) {
        return rdKdtWideItemId($conn);
    }

    return rdItemId($conn);
}

function rdItemMissingMessage(string $type): string
{
    if ($type === RD_REPORT_TYPE_KDTWIDE) {
        return 'KDT Wide Training item was not found.';
    }

    return 'Research & Development item was not found.';
}

function rdMinutesToHours(float $minutes): float
{
    return round($minutes / 60, 2);
}
