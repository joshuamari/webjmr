<?php

function jsonResponse(bool $success, $data = null, string $message = '', int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message,
    ]);

    exit;
}

function jsonSuccess($data = null, string $message = ''): void
{
    jsonResponse(true, $data, $message, 200);
}

function jsonError(string $message = 'Something went wrong.', int $statusCode = 500, $data = null): void
{
    jsonResponse(false, $data, $message, $statusCode);
}