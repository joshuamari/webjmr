<?php

/**
 * MH Report bootstrap: connections, JSON errors, no leaked SQL details.
 */

date_default_timezone_set('Asia/Manila');

function mhPublicErrorMessage(Throwable $e): string
{
    if ($e instanceof PDOException) {
        return 'Database connection failed.';
    }

    return 'Could not load MH Report data.';
}

function mhJsonHeaders(): void
{
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
    }
}

function mhJsonFail(?Throwable $e = null, string $message = ''): void
{
    if ($e instanceof Throwable) {
        error_log('MH Report: ' . $e->getMessage());
        if ($message === '') {
            $message = mhPublicErrorMessage($e);
        }
    } elseif ($message === '') {
        $message = 'Could not load MH Report data.';
    }

    if (!headers_sent()) {
        http_response_code(500);
    }
    mhJsonHeaders();
    echo json_encode([
        'isSuccess' => false,
        'message' => $message,
    ]);
    exit(1);
}

function mhRequireConnections(): void
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
        mhJsonFail(null, 'Database connection failed.');
    }

    $connkdt->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $connnew->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $connwebjmr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
