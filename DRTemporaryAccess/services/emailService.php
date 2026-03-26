<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendUnlockRequestSubmittedEmail(array $request, array $toEmailMap, array $ccEmailMap, array $nameMap): bool
{
    if (!isUnlockEmailEnabled()) {
        error_log('Unlock request submit email skipped: email sending is disabled.');
        return false;
    }

    $employeeId = (string)($request['employee_number'] ?? '');
    $requesterId = (string)($request['requested_by'] ?? '');

    error_log('sendUnlockRequestSubmittedEmail: employeeId=' . $employeeId . ', requesterId=' . $requesterId);
    error_log('sendUnlockRequestSubmittedEmail: raw toEmailMap=' . json_encode($toEmailMap));
    error_log('sendUnlockRequestSubmittedEmail: raw ccEmailMap=' . json_encode($ccEmailMap));

    $toEmails = array_values(array_unique(array_filter(array_map(
        fn($email) => trim((string)$email),
        array_values($toEmailMap)
    ))));

    error_log('sendUnlockRequestSubmittedEmail: normalized toEmails=' . json_encode($toEmails));

    if (empty($toEmails)) {
        error_log('Unlock request submit email skipped: no approver email recipients found.');
        return false;
    }

    $cc = [];

    $employeeEmail = trim((string)($ccEmailMap[$employeeId] ?? ''));
    if ($employeeEmail !== '') {
        $cc[] = $employeeEmail;
    }

    $requesterEmail = trim((string)($ccEmailMap[$requesterId] ?? ''));
    if ($requesterId !== '' && $requesterId !== $employeeId && $requesterEmail !== '') {
        $cc[] = $requesterEmail;
    }

    $cc = array_values(array_unique(array_filter($cc)));

    error_log('sendUnlockRequestSubmittedEmail: normalized cc=' . json_encode($cc));

    $employeeName = $nameMap[$employeeId] ?? $employeeId;
    $requesterName = $nameMap[$requesterId] ?? $requesterId;
    $requestedMonthLabel = formatRequestedMonthEmailLabel((string)($request['requested_month'] ?? ''));
    $dateRequestedLabel = formatDateTimeEmailLabel($request['date_requested'] ?? null);

    $subject = 'Daily Report Temporary Access Request Submitted';

    $body = buildUnlockRequestSubmittedEmailBody([
        'employeeName' => $employeeName,
        'requesterName' => $requesterName,
        'requestedMonthLabel' => $requestedMonthLabel,
        'dateRequestedLabel' => $dateRequestedLabel,
    ]);

    $primaryTo = array_shift($toEmails);

    error_log('sendUnlockRequestSubmittedEmail: primaryTo=' . $primaryTo);
    error_log('sendUnlockRequestSubmittedEmail: final cc=' . json_encode(array_merge($toEmails, $cc)));
    error_log('sendUnlockRequestSubmittedEmail: subject=' . $subject);

    return sendSystemEmail([
        'from' => 'kdt-ph_webjmr@global.kawasaki.com',
        'fromName' => 'WEB JMR',
        'to' => $primaryTo,
        'cc' => array_merge($toEmails, $cc),
        'subject' => $subject,
        'html' => $body,
    ]);
}

function buildUnlockRequestSubmittedEmailBody(array $data): string
{
    $employeeName = htmlspecialchars((string)($data['employeeName'] ?? '—'));
    $requesterName = htmlspecialchars((string)($data['requesterName'] ?? '—'));
    $requestedMonthLabel = htmlspecialchars((string)($data['requestedMonthLabel'] ?? '—'));
    $dateRequestedLabel = htmlspecialchars((string)($data['dateRequestedLabel'] ?? '—'));

    return "
        <p>Good day!</p>

        <p>
            A temporary Daily Report access request has been submitted.
        </p>

        <p><strong>Employee Requested:</strong> {$employeeName}</p>
        <p><strong>Requested By:</strong> {$requesterName}</p>
        <p><strong>Requested Month:</strong> {$requestedMonthLabel}</p>
        <p><strong>Date Requested:</strong> {$dateRequestedLabel}</p>

        <p style='margin-top:10px;'>
            Please review the request in the approval page.
        </p>

        <br>
        <p>— WEB JMR System</p>
    ";
}

function sendSystemEmail(array $payload): bool
{
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = 'mail01.khi.co.jp';
        $mail->SMTPAuth = false;
        $mail->SMTPSecure = false;
        $mail->Port = 25;

        $mail->CharSet = 'UTF-8';

        $from = trim((string)($payload['from'] ?? ''));
        $fromName = trim((string)($payload['fromName'] ?? 'WEB JMR'));
        $to = trim((string)($payload['to'] ?? ''));
        $subject = (string)($payload['subject'] ?? '');
        $html = (string)($payload['html'] ?? '');
        $ccList = $payload['cc'] ?? [];

        error_log('sendSystemEmail: payload from=' . $from . ', to=' . $to . ', subject=' . $subject);
        error_log('sendSystemEmail: payload cc=' . json_encode($ccList));

        if ($from === '' || $to === '' || $subject === '' || $html === '') {
            error_log('sendSystemEmail skipped: missing required payload fields.');
            return false;
        }

        $mail->setFrom($from, $fromName);
        $mail->addAddress($to);

        if (is_array($ccList)) {
            foreach ($ccList as $ccEmail) {
                $ccEmail = trim((string)$ccEmail);
                if ($ccEmail !== '' && strcasecmp($ccEmail, $to) !== 0) {
                    $mail->addCC($ccEmail);
                }
            }
        }

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $html;
        $mail->AltBody = trim(strip_tags(str_replace(
            ['<br>', '<br/>', '<br />', '</p>'],
            ["\n", "\n", "\n", "\n"],
            $html
        )));

        error_log('sendSystemEmail: attempting SMTP send to=' . $to);

        $mail->send();

        error_log('sendSystemEmail: mail sent successfully to=' . $to);
        return true;
    } catch (Exception $e) {
        error_log('PHPMailer send failed: ' . $e->getMessage());
        return false;
    } catch (Throwable $e) {
        error_log('sendSystemEmail fatal: ' . $e->getMessage());
        return false;
    }
}

function formatRequestedMonthEmailLabel(string $requestedMonth): string
{
    if ($requestedMonth === '') {
        return '—';
    }

    $date = DateTime::createFromFormat('Y-m', $requestedMonth);
    if (!$date) {
        return '—';
    }

    return $date->format('F Y');
}

function formatDateTimeEmailLabel(?string $value): string
{
    if (empty($value)) {
        return '—';
    }

    $ts = strtotime($value);
    if (!$ts) {
        return '—';
    }

    return date('Y-m-d h:i A', $ts);
}

function isUnlockEmailEnabled(): bool
{
    return defined('WEBJMR_ENABLE_EMAILS') && WEBJMR_ENABLE_EMAILS === true;
}