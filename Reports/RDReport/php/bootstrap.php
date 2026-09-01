<?php

/**
 * R&D Manhour Report bootstrap: connections, JSON errors, no leaked SQL details.
 */

date_default_timezone_set('Asia/Manila');

const RD_ALL_GROUPS = '__all__';
const RD_ACCESS_PERMISSION = 54;
const RD_ALL_GROUP_ACCESS = 55;

function rdHasAccess($employeeId): bool
{
    return checkAccess(RD_ACCESS_PERMISSION, $employeeId);
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

function rdItemId(PDO $conn): int
{
    $stmt = $conn->prepare(
        "SELECT i.fldID
         FROM itemofworkstable AS i
         JOIN projectstable AS p ON p.fldID = i.fldProject
         WHERE p.fldProject = 'KDT Internal Activities'
           AND i.fldItem = 'Research & Development'
           AND i.fldDelete = '0'
         LIMIT 1"
    );
    $stmt->execute();
    $value = $stmt->fetchColumn();

    return $value !== false ? (int) $value : 0;
}

function rdMinutesToHours(float $minutes): float
{
    return round($minutes / 60, 2);
}
