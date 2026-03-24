<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendUnlockRequestDecisionEmail(array $request, array $emailMap, array $nameMap, array $surnameMap): bool
{
    if (!isUnlockEmailEnabled()) {
        error_log('Unlock email skipped: email sending is disabled.');
        return true;
    }
    
    $employeeId = (string)($request['employee_number'] ?? '');
    $requesterId = (string)($request['requested_by'] ?? '');
    $approverId = (string)($request['action_by'] ?? '');
    $status = strtolower(trim((string)($request['status'] ?? '')));
    

    $to = trim((string)($emailMap[$employeeId] ?? ''));

    if ($to === '') {
        error_log("Unlock email skipped: missing employee email for employee_number={$employeeId}");
        return false;
    }

    $cc = [];

    $requesterEmail = trim((string)($emailMap[$requesterId] ?? ''));
    if ($requesterId !== '' && $requesterId !== $employeeId && $requesterEmail !== '') {
        $cc[] = $requesterEmail;
    }

    $approverEmail = trim((string)($emailMap[$approverId] ?? ''));
    if ($approverEmail !== '') {
        $cc[] = $approverEmail;
    }

    $cc = array_values(array_unique($cc));

    $employeeName = $nameMap[$employeeId] ?? $employeeId;
    $approverName = $nameMap[$approverId] ?? $approverId;
    $employeeSurname = $surnameMap[$employeeId] ?? $employeeId;
    $requestedMonthLabel = formatRequestedMonthEmailLabel((string)($request['requested_month'] ?? ''));
    $actionAtLabel = formatDateTimeEmailLabel($request['action_at'] ?? null);
    $expirationLabel = formatDateTimeEmailLabel($request['expiration_date'] ?? null);

    $subject = $status === 'approved'
        ? 'Daily Report Access Request Approved'
        : 'Daily Report Access Request Denied';

    $body = buildUnlockRequestDecisionEmailBody([
        'status' => $status,
        'employeeName' => $employeeName,
        'employeeSurname' => $employeeSurname,
        'requestedMonthLabel' => $requestedMonthLabel,
        'approverName' => $approverName,
        'actionAtLabel' => $actionAtLabel,
        'expirationLabel' => $expirationLabel
    ]);

    return sendSystemEmail([
        'from' => 'kdt-ph_webjmr@global.kawasaki.com',
        'fromName' => 'WEB JMR',
        'to' => $to,
        'cc' => $cc,
        'subject' => $subject,
        'html' => $body,
    ]);
}

function buildUnlockRequestDecisionEmailBody(array $data): string
{
    $status = strtolower(trim((string)($data['status'] ?? '')));
    $statusLabel = strtoupper($status);

    $employeeName = htmlspecialchars((string)($data['employeeName'] ?? '—'));
    $employeeSurname = htmlspecialchars((string)($data['employeeSurname'] ?? ''));
    $requestedMonthLabel = htmlspecialchars((string)($data['requestedMonthLabel'] ?? '—'));
    $approverName = htmlspecialchars((string)($data['approverName'] ?? '—'));
    $actionAtLabel = htmlspecialchars((string)($data['actionAtLabel'] ?? '—'));
    $expirationLabel = htmlspecialchars((string)($data['expirationLabel'] ?? '—'));

    $expirySection = '';
    if ($status === 'approved' && $expirationLabel !== '—') {
        $expirySection = "
            <p style='margin-top:10px;'>
                <strong>Access Expires On:</strong> {$expirationLabel}
            </p>
            <p style='color:#b91c1c; font-size:13px;'>
                Note: Access is limited to 1 day only and cannot be extended automatically.
            </p>
        ";
    }

    $actionInstruction = '';
    if ($status === 'approved') {
        $actionInstruction = "
            <p style='margin-top:10px; color:#b91c1c; font-weight:500;'>
                ⚠ You can now edit your Daily Report. Please complete your updates before the access expires.
            </p>
        ";
    } elseif ($status === 'denied') {
        $actionInstruction = "
            <p style='margin-top:10px;'>
                If you believe this request should be reconsidered, please coordinate with your approver.
            </p>
        ";
    }

    return "
        <p>Dear {$employeeSurname}-san,</p>

        <p>Good day!</p>

        <p>
            The temporary Daily Report access request for
            <strong>{$employeeName}</strong>
            for <strong>{$requestedMonthLabel}</strong>
            has been <strong>{$statusLabel}</strong>.
        </p>

        <p><strong>Processed By:</strong> {$approverName}</p>
        <p><strong>Processed On:</strong> {$actionAtLabel}</p>

        {$expirySection}

        {$actionInstruction}

        <br>
        <p>— WEB JMR System</p>
    ";
}

function sendSystemEmail(array $payload): bool
{
    $mail = new PHPMailer(true);

    try {
        /**
         * Replace these SMTP values with your real mail server settings.
         */
        $mail->isSMTP();
        $mail->Host = 'mail01.khi.co.jp';
        $mail->SMTPAuth = false;
        $mail->SMTPSecure = false;
        // $mail->Username = 'kdt-ph_webjmr@global.kawasaki.com';
        // $mail->Password = 'YOUR_SMTP_PASSWORD';
        // $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 25;

        $mail->CharSet = 'UTF-8';

        $from = trim((string)($payload['from'] ?? ''));
        $fromName = trim((string)($payload['fromName'] ?? 'WEB JMR'));
        $to = trim((string)($payload['to'] ?? ''));
        $subject = (string)($payload['subject'] ?? '');
        $html = (string)($payload['html'] ?? '');
        $ccList = $payload['cc'] ?? [];

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
        $mail->AltBody = trim(strip_tags(str_replace(['<br>', '<br/>', '<br />', '</p>'], ["\n", "\n", "\n", "\n"], $html)));

        $mail->send();
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
