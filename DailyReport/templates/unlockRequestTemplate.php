<?php

function buildUnlockRequestEmail(array $data): array
{
    $employeeNum = $data['employeeNumber'];
    $unlockDate = $data['unlockDate'];
    $requestedBy = $data['requestedBy'];
    $dateRequested = $data['dateRequested'];

    $subject = "Unlock Request - {$unlockDate}";

    $htmlBody = "
        <html>
        <body>
            <p>An unlock request has been submitted.</p>
            <table cellpadding='6' cellspacing='0' border='1'>
                <tr><td><strong>Employee Number</strong></td><td>{$employeeNum}</td></tr>
                <tr><td><strong>Unlock Month</strong></td><td>{$unlockDate}</td></tr>
                <tr><td><strong>Requested By</strong></td><td>{$requestedBy}</td></tr>
                <tr><td><strong>Date Requested</strong></td><td>{$dateRequested}</td></tr>
            </table>
        </body>
        </html>
    ";

    return [
        'subject' => $subject,
        'htmlBody' => $htmlBody,
    ];
}