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
        // Replace with your real approval page URL if you already have it
        'approvalUrl' => 'http://kdt-ph/webJMR/DailyReportApprovals/',
    ]);

    $primaryTo = array_shift($toEmails);

    error_log('sendUnlockRequestSubmittedEmail: primaryTo=' . $primaryTo);
    error_log('sendUnlockRequestSubmittedEmail: final cc=' . json_encode(array_merge($toEmails, $cc)));
    error_log('sendUnlockRequestSubmittedEmail: subject=' . $subject);

    return sendSystemEmail([
        'from' => 'sh.kdt_sys_helpdesk@global.kawasaki.com',
        'fromName' => 'WEB JMR',
        'to' => $primaryTo,
        'cc' => array_merge($toEmails, $cc),
        'subject' => $subject,
        'html' => $body,
        'embedded_images' => [
    [
        'path' => __DIR__ . '/../public/bg.png',
        'cid' => 'header_bg',
        'name' => 'bg.png',
    ],
    [
        'path' => __DIR__ . '/../public/pending.png',
        'cid' => 'pending_icon',
        'name' => 'pending.png',
    ],
    [
        'path' => __DIR__ . '/../public/user.png',
        'cid' => 'person_icon',
        'name' => 'user.png',
    ],
    [
        'path' => __DIR__ . '/../public/calendar.png',
        'cid' => 'calendar_icon',
        'name' => 'calendar.png',
    ],
    [
        'path' => __DIR__ . '/../public/clock.png',
        'cid' => 'clock_icon',
        'name' => 'clock.png',
    ],
    [
        'path' => __DIR__ . '/../public/info.png',
        'cid' => 'info_icon',
        'name' => 'info.png',
    ],
    [
        'path' => __DIR__ . '/../public/check.png',
        'cid' => 'check_icon',
        'name' => 'check.png',
    ],
    [
        'path' => __DIR__ . '/../public/denied.png',
        'cid' => 'deny_icon',
        'name' => 'denied.png',
    ],
],
    ]);
}

function buildUnlockRequestSubmittedEmailBody(array $data): string
{
    $employeeName = htmlspecialchars((string)($data['employeeName'] ?? '—'));
    $requesterName = htmlspecialchars((string)($data['requesterName'] ?? '—'));
    $requestedMonthLabel = htmlspecialchars((string)($data['requestedMonthLabel'] ?? '—'));
    $dateRequestedLabel = htmlspecialchars((string)($data['dateRequestedLabel'] ?? '—'));
    $approvalUrl = htmlspecialchars((string)($data['approvalUrl'] ?? '#'));
    $approverName = htmlspecialchars((string)($data['approverName'] ?? 'Approver'));


    $backgroundImg = '<img src="cid:header_bg" width="100%" style="position:absolute; display: block; width: 100%; height: auto; border: 0; outline: none; text-decoration: none; top:0; left:0; bottom:0; right:0;" />';

    $pendingIcon = '<img src="cid:pending_icon" width="20" height="20" alt=""  style="display:block; width:20px; height:20px; border:0;">';

    $personIcon = '<img src="cid:person_icon" width="20" height="20" alt=""  style="display:block; width:20px; height:20px; border:0;">';

    $calendarIcon = '<img src="cid:calendar_icon" width="20" height="20" alt=""    style="display:block; width:20px; height:20px; border:0;">';

    $clockIcon = '<img src="cid:clock_icon" width="20" height="20" alt=""  style="display:block; width:20px; height:20px; border:0;">';

    $infoIcon = '<img src="cid:info_icon" width="20" height="20" alt=""    style="display:block; width:20px; height:20px; border:0;">';

    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Report Access Request Submitted</title>
</head>
<body style="margin:0; padding:0; background:#f3f5fb; font-family:Segoe UI,Arial, Helvetica, sans-serif; color:#25324b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eeedf8; margin:0; padding:32px 0;">
    	<tr>
    	  <td align="center">
          <table role="presentation" width="840" cellpadding="0"cellspacing="0" border="0" style="width:840px;max-width:840px; background: #f7f6fd; border:1px solid;#d9ddf1; border-radius:22px; overflow:hidden;">
              
            <tr>
              <td>
                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="position: relative"
                >
                  <!-- <tr>
                    <td>
                      {$backgroundImg}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="
                        padding: 24px 28px 22px 28px;
                        border-top-left-radius: 22px;
                        border-top-right-radius: 22px;
                        position: fixed;
                      "
                    >
                      <table
                        role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0">
                        <tr>
                          <td valign="top" style="color: #ffffff">
                            <div
                              style="
                                font-size: 15px;
                                color: #eaf1ff;
                                margin-bottom: 10px;
                              "
                            >
                              Web JMR System
                            </div>
                            <div
                              style="
                                font-size: 28px;
                                line-height: 1.25;
                                font-weight: 500;
                                color: #ffffff;
                                margin-bottom: 10px;
                              "
                            >
                              Daily Report Access Request Submitted
                            </div>
                            <div
                              style="
                                font-size: 15px;
                                line-height: 1.6;
                                color: #eaf1ff;
                              "
                            >
                              A temporary Daily Report access request is
                              awaiting your review
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr> -->
									<tr>
                    <td
                      style="
                        padding: 24px 28px 22px 28px;
                        border-top-left-radius: 22px;
                        border-top-right-radius: 22px;
                        background-color:#6887d3">
                      <table
                        role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0">
                        <tr>
                          <td valign="top" style="color: #ffffff">
                            <div
                              style="
                                font-size: 15px;
                                color: #eaf1ff;
                                margin-bottom: 10px;
                              "
                            >
                              Web JMR System
                            </div>
                            <div
                              style="
                                font-size: 28px;
                                line-height: 1.25;
                                font-weight: 500;
                                color: #ffffff;
                                margin-bottom: 10px;
                              "
                            >
                              Daily Report Access Request Submitted
                            </div>
                            <div
                              style="
                                font-size: 15px;
                                line-height: 1.6;
                                color: #eaf1ff;
                              "
                            >
                              A temporary Daily Report access request is
                              awaiting your review
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:30px 36px 30px 36px; background: #f7f6fd">
                <div style="font-size:18px; line-height:1.4;font-weight:700; color:#25324b; margin-bottom:20px;">
                  Dear {$approverName},
                </div>

                <div style="font-size:16px; line-height:1.7;color:#3D4A63; margin-bottom:18px;">
                                A temporary Daily Report access request has been submitted and is awaiting your action.
                </div>

                <table role="presentation" width="100%"cellpadding="0" cellspacing="0" border="0"style="border:1px solid #d9ddf1; border-radius:16px;overflow:hidden; background:#FFFFFF;">
                	<tr>
                    <td style="padding:18px 20px; background:#F1F6FF; border-bottom:1px solid #E2E8F5;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;">{$pendingIcon}</td>
                        <td style="width:10px;"></td>
                      	<td style="vertical-align:middle; font-size:16px; font-weight:700; color:#355FD1; letter-spacing:0.2px;">
                          PENDING REVIEW
                        </td>
                      </tr>
                    </table>
                  	</td>
                	</tr>

                	<tr>
                  <td style="padding:0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="width:50%; padding:14px 18px; border-bottom:1px solid #E4E8F4;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="vertical-align:middle;">{$personIcon}</td>
                              <td style="width:12px;"></td>
                              <td style="vertical-align:middle; font-size:15px; font-weight:700; color:#2F3C56;">Employee:</td>
                            </tr>
                          </table>
                        </td>
                        <td style="width:50%; padding:14px 18px; border-bottom:1px solid #E4E8F4; font-size:15px; color:#2F3C56;">
                          {$employeeName}
                        </td>
                      </tr>

                      <tr>
                        <td style="width:50%; padding:14px 18px; border-bottom:1px solid #E4E8F4;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="vertical-align:middle;">{$personIcon}</td>
                              <td style="width:12px;"></td>
                              <td style="vertical-align:middle; font-size:15px; font-weight:700; color:#2F3C56;">
																Requested By:
															</td>
                            </tr>
                          </table>
                        </td>
                        <td style="width:50%; padding:14px 18px; border-bottom:1px solid #E4E8F4; font-size:15px; color:#2F3C56;">
                          {$requesterName}
                        </td>
                      </tr>

                      <tr>
                        <td style="width:50%; padding:14px 18px; border-bottom:1px solid #E4E8F4;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="vertical-align:middle;">{$calendarIcon}</td>
                              <td style="width:12px;"></td>
                              <td style="vertical-align:middle; font-size:15px; font-weight:700; color:#2F3C56;">
																Requested Month:
															</td>
                            </tr>
                          </table>
                        </td>
                        <td style="width:50%; padding:14px 18px; border-bottom:1px solid #E4E8F4; font-size:15px; color:#2F3C56;">
                          {$requestedMonthLabel}
                        </td>
                      </tr>

                      <tr>
                        <td style="width:50%; padding:14px 18px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="vertical-align:middle;">{$clockIcon}</td>
                              <td style="width:12px;"></td>
                              <td style="vertical-align:middle; font-size:15px; font-weight:700; color:#2F3C56;">
																Requested On:
															</td>
                            </tr>
                          </table>
                        </td>
                        <td style="width:50%; padding:14px 18px; font-size:15px; color:#2F3C56;">
                          {$dateRequestedLabel}
                        </td>
                      </tr>
                    </table>
                  </td>
                	</tr>
              	</table>

                <table role="presentation" width="100%"cellpadding="0" cellspacing="0" border="0"style="margin-top:14px; background:#EFF3FF;border:1px solid #D8E1F5; border-radius:12px;">
                  <tr>
                    <td style="padding:14px 16px;">
                      <table role="presentation" cellpadding="0"cellspacing="0" border="0">
                        <tr>
                          <td style="vertical-align:middle;">{$infoIcon}</td>
                          <td style="width:12px;"></td>
                          <td style="vertical-align:middle; font-size:14px; line-height:1.7; color:#4B5C82;">
                                Please review this request through the <span style="color:#355FD1; font-weight:500;">Temporary Access Approval</span> page.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px auto 0 auto;">
                  <tr>
                    <td align="center" bgcolor="#3F6FE4"style="border-radius:10px;line-height:1.7; padding:14px 28px;">
                      <a href="{$approvalUrl}" target="_blank"style="display:inline-block; min-width:260px;text-align:center;  font-size:16px;font-weight:600; color:#FFFFFF;text-decoration:none;">
                          Review Access Request
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 36px 30px 36px; background: #f7f6fd; border-bottom-left-radius: 22px; border-bottom-right-radius: 22px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8ff; border-top:1px solid #e1e9f5; border-radius:0 0 14px 14px;">
                  <tr>
                    <td align="center" style="padding:18px 20px; font-size:13px; color:#6a7a94;">
                      This is an automated notification from the Web JMR System.
                    </td>
                                     
                  </tr>
                </table>
              </td>  
                       
            </tr>

          </table>
               
    	  </td>
    	</tr>
    </table>
</body>
</html>
HTML;
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
        $embeddedImages = $payload['embedded_images'] ?? [];

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
        if (is_array($embeddedImages)) {
            foreach ($embeddedImages as $img) {
                $path = (string)($img['path'] ?? '');
                $cid = (string)($img['cid'] ?? '');
                $name = (string)($img['name'] ?? basename($path));

                if ($path === '' || $cid === '') {
                    continue;
                }

                if (!file_exists($path)) {
                    error_log("Embedded image missing: {$path}");
                    continue;
                }

                $mail->addEmbeddedImage($path, $cid, $name);
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