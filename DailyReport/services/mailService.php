<?php

function sendUnlockRequestNotification(array $toEmails, array $ccEmails, string $subject, string $htmlBody): bool
{
    if (empty($toEmails)) {
        error_log('sendUnlockRequestNotification: no TO recipients provided.');
        return false;
    }

    $to = implode(',', $toEmails);

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";
    $headers .= "From: kdtdev01-kdt@corp.khi.co.jp\r\n";

    if (!empty($ccEmails)) {
        $headers .= "Cc: " . implode(',', $ccEmails) . "\r\n";
    }

    $result = mail($to, $subject, $htmlBody, $headers);

    if (!$result) {
        error_log('mail() returned false. TO=' . $to . ' CC=' . implode(',', $ccEmails));
    }

    return $result;
}