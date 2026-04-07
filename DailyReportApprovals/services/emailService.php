<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendUnlockRequestDecisionEmail(array $request, array $emailMap, array $nameMap, array $surnameMap): bool
{
    if (!isUnlockEmailEnabled()) {
        error_log('Unlock decision email skipped: email sending is disabled.');
        return false;
    }

    $employeeId = (string)($request['employee_number'] ?? '');
    $requesterId = (string)($request['requested_by'] ?? '');
    $approverId = (string)($request['action_by'] ?? '');
    $status = strtolower(trim((string)($request['status'] ?? '')));

    error_log('sendUnlockRequestDecisionEmail: employeeId=' . $employeeId . ', requesterId=' . $requesterId . ', approverId=' . $approverId . ', status=' . $status);
    error_log('sendUnlockRequestDecisionEmail: raw emailMap=' . json_encode($emailMap));
    error_log('sendUnlockRequestDecisionEmail: raw nameMap=' . json_encode($nameMap));
    error_log('sendUnlockRequestDecisionEmail: raw surnameMap=' . json_encode($surnameMap));

    $to = trim((string)($emailMap[$employeeId] ?? ''));
    if ($to === '') {
        error_log("Unlock decision email skipped: missing employee email for employee_number={$employeeId}");
        return false;
    }
error_log('sendUnlockRequestDecisionEmail: raw emailMap=' . json_encode($emailMap));

$requesterEmail = trim((string)($emailMap[$requesterId] ?? ''));
$approverEmail = trim((string)($emailMap[$approverId] ?? ''));

error_log('sendUnlockRequestDecisionEmail: requesterEmail=' . $requesterEmail);
error_log('sendUnlockRequestDecisionEmail: approverEmail=' . $approverEmail);
error_log('sendUnlockRequestDecisionEmail: to=' . $to);
    $cc = [];

    // CC requester if different from employee
    $requesterEmail = trim((string)($emailMap[$requesterId] ?? ''));
    if ($requesterId !== '' && $requesterId !== $employeeId && $requesterEmail !== '') {
        $cc[] = $requesterEmail;
    }

    // CC approver if different from employee
    $approverEmail = trim((string)($emailMap[$approverId] ?? ''));
    if ($approverId !== '' && $approverId !== $employeeId && $approverEmail !== '') {
        $cc[] = $approverEmail;
    }

    // dedupe + remove blanks
    $cc = array_values(array_unique(array_filter($cc)));

    // remove TO from CC just in case
    $cc = array_values(array_filter($cc, function ($email) use ($to) {
        return strcasecmp($email, $to) !== 0;
    }));

    error_log('sendUnlockRequestDecisionEmail: normalized to=' . json_encode($to));
    error_log('sendUnlockRequestDecisionEmail: normalized cc=' . json_encode($cc));

    $employeeName = $nameMap[$employeeId] ?? $employeeId;
    $employeeSurname = $surnameMap[$employeeId] ?? $employeeId;
    $requesterName = $nameMap[$requesterId] ?? $requesterId;
    $approverName = $nameMap[$approverId] ?? $approverId;

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
        'requestedByName' => $requesterName,
        'requestedMonthLabel' => $requestedMonthLabel,
        'approverName' => $approverName,
        'actionAtLabel' => $actionAtLabel,
        'expirationLabel' => $expirationLabel,
        'tempAccessUrl' => 'http://kdt-ph/webJMR/DRTemporaryAccess/',
    ]);

    file_put_contents(__DIR__ . '/email-debug.html', $body);

    $altBody = trim(strip_tags(str_replace(
        ['<br>', '<br/>', '<br />', '</p>'],
        ["\n", "\n", "\n", "\n"],
        $body
    )));

    file_put_contents(__DIR__ . '/email-debug.txt', $altBody);

    error_log('sendUnlockRequestDecisionEmail: requestedMonthLabel=' . $requestedMonthLabel);
    error_log('sendUnlockRequestDecisionEmail: actionAtLabel=' . $actionAtLabel);
    error_log('sendUnlockRequestDecisionEmail: expirationLabel=' . $expirationLabel);
    error_log('sendUnlockRequestDecisionEmail: subject=' . $subject);
    error_log('sendUnlockRequestDecisionEmail: final to=' . json_encode($to));
    error_log('sendUnlockRequestDecisionEmail: final cc=' . json_encode($cc));
    error_log('sendUnlockRequestDecisionEmail: email-debug.html written to ' . __DIR__ . '/email-debug.html');
    error_log('sendUnlockRequestDecisionEmail: email-debug.txt written to ' . __DIR__ . '/email-debug.txt');

    return sendSystemEmail([
        'from' => 'sh.kdt_sys_helpdesk@global.kawasaki.com',
        'fromName' => 'WEB JMR',
        'to' => $to,
        'cc' => $cc,
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

function buildUnlockRequestDecisionEmailBody(array $data): string
{
    $status = strtolower(trim((string)($data['status'] ?? '')));
    $isApproved = $status === 'approved';

    $employeeName = htmlspecialchars((string)($data['employeeName'] ?? '—'));
    $employeeSurname = htmlspecialchars((string)($data['employeeSurname'] ?? ''));
    $requestedByName = htmlspecialchars((string)($data['requestedByName'] ?? '—'));
    $requestedMonthLabel = htmlspecialchars((string)($data['requestedMonthLabel'] ?? '—'));
    $approverName = htmlspecialchars((string)($data['approverName'] ?? '—'));
    $actionAtLabel = htmlspecialchars((string)($data['actionAtLabel'] ?? '—'));
    $expirationLabel = htmlspecialchars((string)($data['expirationLabel'] ?? '—'));
    $tempAccessUrl = htmlspecialchars((string)($data['tempAccessUrl'] ?? '#'));

    $backgroundImg = '<img src="cid:header_bg" width="100%" style=" position: absolute; display: block; width: 100%; height: auto; border: 0; outline: none; text-decoration: none; top: 0; left: 0; bottom: 0; right: 0; " />';

    $pendingIcon = '<img src="cid:pending_icon" width="20" height="20" alt=""  style="display:block; width:20px; height:20px; border:0;">';

    $personIcon = '<img src="cid:person_icon" width="20" height="20" alt=""  style="display:block; width:20px; height:20px; border:0;">';

    $calendarIcon = '<img src="cid:calendar_icon" width="20" height="20" alt=""    style="display:block; width:20px; height:20px; border:0;">';

    $clockIcon = '<img src="cid:clock_icon" width="20" height="20" alt=""  style="display:block; width:20px; height:20px; border:0;">';

    $infoIcon = '<img src="cid:info_icon" width="20" height="20" alt=""    style="display:block; width:20px; height:20px; border:0;">';

    $checkIcon = '<img src="cid:check_icon" width="20" height="20" alt=""  style="display:block; width:20px; height:20px; border:0;">';

    $denyIcon = '<img src="cid:deny_icon" width="20" height="20" alt=""  style="display:block; width:20px; height:20px; border:0;">';

    $title = $isApproved
        ? 'Access Request Approved'
        : 'Access Request Denied';

    $headlineCopy = $isApproved
        ? "You can now access and update the Daily Report for <strong>{$requestedMonthLabel}</strong>."
        : "The temporary access request for the Daily Report for <strong>{$requestedMonthLabel}</strong> was not approved.";

    $statusCopy = "";
    if ($isApproved && $expirationLabel !== '—') {
        $statusCopy = "
        <td
          bgcolor=\"#eff7ee\"
            style=\"
            margin-bottom: 18px;
          padding: 16px 18px;
          background: #eff7ee;
          border: 1px solid #d7ead3;
          \"
          colspan=\"2\"
         >
          <table
            role=\"presentation\"
            cellpadding=\"0\"
            cellspacing=\"0\"
            border=\"0\"
          >
            <tr>
              <td
                style=\"
                  font-size: 13px;
                  color: #4b7d58;
                  font-weight: 700;
                  letter-spacing: 0.2px;
                  margin-bottom: 6px;
                \"
              >
                VALID UNTIL
              </td>
            </tr>
            <tr>
              <td>
                <table>
                  <tr>
                    <td style=\"vertical-align: middle\">
                      {$checkIcon}
                    </td>
                    <td style=\"width: 8px\"></td>
                    <td
                      style=\"
                      font-size: 22px;
                      font-weight: 700;
                      color: #1f9d55;
                      \"
                    >
                      {$expirationLabel}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>";
    } else {
        $statusCopy =
            "<td bgcolor=\"#f7efee\" style=\"margin-bottom: 18px; padding: 16px 18px; background: #f7efee; border: 1px solid #ebd4d1; \"
      colspan=\"2\"
      >
            <table>
                <tr>
                    <td style=\"vertical-align: middle\">
                             {$denyIcon}
                    
                    </td>
                    <td style=\"width: 8px\"></td>
                    <td style=\"
                             font-size: 18px;
                             font-weight: 700;
                             color: #d64545;
                        \"
                    >
                        DENIED
                    </td>
                </tr>
            </table>
      </td>";
    }

    $urgentBox = '';
    if ($isApproved) {
        $urgentBox = "
            <table
                  bgcolor=\"#ffffff\"
                  role=\"presentation\"
                  width=\"100%\"
                  cellpadding=\"0\"
                  cellspacing=\"0\"
                  border=\"0\"
                  style=\"
                    border: 1px solid #d9ddf1;
                    border-radius: 16px;
                    overflow: hidden;
                    background: #ffffff;
                    margin-top:14px;
                  \"
                >
                  <tr
                    bgcolor=\"#fff6e7\"
                    style=\"
                      margin: 18px 0;
                      border: 1px solid #f5d7a1;
                      background: #fff6e7;
                      border-radius: 14px;
                      overflow: hidden;
                    \"
                  >
                    <td
                      style=\"
                        padding: 14px 18px;
                        border-bottom: 1px solid #f2dfbb;
                        color: #7a4b00;
                        font-weight: 700;
                        font-size: 14px;
                      \"
                    >
                      IMPORTANT
                    </td>
                  </tr>
                  <tr bgcolor=\"#fff6e7\" style=\" background: #fff6e7;\">
                    <td
                      style=\"
                        padding: 14px 18px;
                        color: #5f4b21;
                        font-size: 15px;
                        line-height: 1.65;
                      \"
                    >
                      This access is temporary and will be automatically locked
                      at
                      <strong>{$expirationLabel}</strong>.<br />
                      Please complete all necessary updates before this time.
                    </td>
                  </tr>
                 
                </table>
        ";
    } else {
        $urgentBox = "
        <table
         bgcolor=\"#ffffff\"
         role=\"presentation\"
         width=\"100%\"
         cellpadding=\"0\"
         cellspacing=\"0\"
         border=\"0\"
         style=\"
           border: 1px solid #d9ddf1;
           border-radius: 16px;
           overflow: hidden;
           background: #ffffff;
           margin-top:14px;
         \"
        >
          <tr
            bgcolor=\"#fff6e7\"
            style=\"
              margin: 18px 0;
              border: 1px solid #f5d7a1;
              background: #fff6e7;
              border-radius: 14px;
              overflow: hidden;
            \"
          >
           <td
             style=\"
               padding: 14px 18px;
               border-bottom: 1px solid #f2dfbb;
               color: #7a4b00;
               font-weight: 700;
               font-size: 14px;
             \"
           >
             NOTICE
           </td>
          </tr>
          <tr bgcolor=\"#fff6e7\" style=\" background: #fff6e7;\">
            <td
              style=\"
                padding: 14px 18px;
                color: #5f4b21;
                font-size: 15px;
                line-height: 1.65;
              \"
            >
              Access was not granted for this request.<br />
              Please coordinate with the approver if you believe the
              request should be reconsidered.
            </td>
          </tr>
        </table>
      ";
    }

    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$title}</title>
</head>
<body style="margin:0; padding:0; background:#f3f5fb; font-family:Segoe UI,Arial, Helvetica, sans-serif; color:#25324b;">
  <table bgcolor="#eeedf8"  role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eeedf8; margin:0; padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="840" cellpadding="0" bgcolor="#f7f6fd" cellspacing="0" border="0" style="width:840px; max-width:840px;  background: #f7f6fd; border:1px solid #d9ddf1; border-radius:22px; overflow:hidden;"
                >
          <!-- HEADER     -->
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
                  <tr>
                    <td
                     bgcolor="#6887d3"
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
                        border="0"
                      >
                        <tr>
                          <td valign="top" style="color: #ffffff">
                            <div style=" font-size: 15px; color: #eaf1ff; margin-bottom: 10px;">Web JMR Systems</div> 
                           
                            <div
                              style="
                                font-size: 28px;
                                line-height: 1.25;
                                font-weight: 500;
                                color: #ffffff;
                                margin-bottom: 10px;
                              "
                            >
                              {$title}
                            </div>
                            <div
                              style="
                                font-size: 15px;
                                line-height: 1.6;
                                color: #eaf1ff;
                              "
                            >
                              Temporary Daily Report access request update
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
                        <!-- TOP TEXT -->
            <td style="padding:30px 36px 30px 36px; background: #f7f6fd">
              <div style="font-size:18px; font-weight:700; color:#25324b; margin-bottom:20px;">
                  Dear {$employeeSurname}-san,
              </div>
              <div style="font-size:16px; line-height:1.7; color:#3D4A63; margin-bottom:18px;">
                  Good day.
              </div>
              <div style="font-size:18px; line-height:1.7; color:#25324b; margin-bottom:18px;">
                  {$headlineCopy}
              </div>
                    
                       
                            <!-- MAIN INFO TABLE -->
              <table
                role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #d9ddf1; border-radius: 16px; overflow: hidden; background: #ffffff;">
                  <tr>
                    <td >
                      <table
                        role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        style="
                          border-collapse: collapse;
                          border: 1px solid #dbe3ef;
                          border-radius: 14px;
                          overflow: hidden;
                        "
                      >
                        <tr>
                          {$statusCopy}
                        </tr>
                        <tr>
                          <td
                            style="
                              width: 50%;
                              padding: 14px 18px;
                              border-bottom: 1px solid #e4e8f4;
                            "
                          > 
                           <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              border="0"
                            >
                            <tr>
                              <td style="vertical-align: middle">
                                  {$personIcon}
                                </td>
                                <td style="width: 12px"></td>
                              <td
                           style="
                                    vertical-align: middle;
                                    font-size: 15px;
                                    font-weight: 700;
                                    color: #2f3c56;
                                  "
                          >
                            Employee
                              </td>
                            </tr>
                            </table>
                            </td>
                            <td
                            style="
                              padding: 14px 16px;
                              font-size: 15px;
                              color: #25324b;
                              border-bottom: 1px solid #e8eef7;
                            "
                            >
                            <strong>{$employeeName}</strong>
                            </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              width: 50%;
                              padding: 14px 18px;
                              border-bottom: 1px solid #e4e8f4;
                            "
                          > 
                          <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              border="0"
                            >
                            <tr>
                               <td style="vertical-align: middle">
                                 {$personIcon}
                                </td>
                                <td style="width: 12px"></td>
                          <td
                                  style="
                                    vertical-align: middle;
                                    font-size: 15px;
                                    font-weight: 700;
                                    color: #2f3c56;
                                  "
                                >
                            Requested By
                          </td>
                          </tr>
                          </table>
                          </td>
                          <td
                            style="
                              padding: 14px 16px;
                              font-size: 15px;
                              color: #25324b;
                              border-bottom: 1px solid #e8eef7;
                            "
                          >
                            {$requestedByName}
                          </td>
                        </tr>
                        <tr>
                         <td
                            style="
                              width: 50%;
                              padding: 14px 18px;
                              border-bottom: 1px solid #e4e8f4;
                            "
                          >
                          <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              border="0"
                            >
                              <tr>
                                 <td style="vertical-align: middle">
                                  {$calendarIcon}
                                </td>
                                <td style="width: 12px"></td>
                                 <td
                                  style="
                                    vertical-align: middle;
                                    font-size: 15px;
                                    font-weight: 700;
                                    color: #2f3c56;
                                  "
                                >
                                  Requested Month
                                </td>
                              </tr>
                          </table>
                          </td>
                          <td
                            style="
                              padding: 14px 16px;
                              font-size: 15px;
                              color: #25324b;
                              border-bottom: 1px solid #e8eef7;
                            "
                          >
                            {$requestedMonthLabel}
                          </td>
                        </tr>
                        <tr>

                          <td
                            style="
                              width: 50%;
                              padding: 14px 18px;
                              border-bottom: 1px solid #e4e8f4;
                            "
                          >
                            <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              border="0"
                            >
                              <tr>
                                <td style="vertical-align: middle">
                                  {$personIcon}
                                </td>
                                <td style="width: 12px"></td>
                                <td
                                  style="
                                    vertical-align: middle;
                                    font-size: 15px;
                                    font-weight: 700;
                                    color: #2f3c56;
                                  "
                                >
                                  Processed By
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td
                            style="
                              padding: 14px 16px;
                              font-size: 15px;
                              color: #25324b;
                              border-bottom: 1px solid #e8eef7;
                            "
                          >
                            {$approverName}
                          </td>
                        </tr>
                        <tr>
                          <td style="width: 50%; padding: 14px 18px">
                            <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              border="0"
                            >
                              <tr>
                                <td style="vertical-align: middle">
                                  {$clockIcon}
                                </td>
                                <td style="width: 12px"></td>
                                <td
                                  style="
                                    vertical-align: middle;
                                    font-size: 15px;
                                    font-weight: 700;
                                    color: #2f3c56;
                                  "
                                >
                                  Processed On
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td
                            style="
                              padding: 14px 16px;
                              font-size: 15px;
                              color: #25324b;
                            "
                          >
                            {$actionAtLabel}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
              </table>
                                
              {$urgentBox}
                            

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px; background:#EFF3FF; border:1px solid #D8E1F5; border-radius:12px;">
                <tr>
                                    <td style="padding:14px 16px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="vertical-align:middle;">{$infoIcon}</td>
                                                <td style="width:12px;"></td>
                                                <td style="vertical-align:middle; font-size:14px; line-height:1.7; color:#4B5C82;">
                                                       You can review the full request details and current status anytime on the <span style="color:#355FD1; font-weight:500;">Temporary Access Request</span> page.
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                </tr>
              </table>
              
              <!-- CTA button -->
              <table
                  role="presentation"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="margin: 18px auto 0 auto"
                >
                  <tr>
                    <td
                      align="center"
                      bgcolor="#3F6FE4"
                      style="
                        border-radius: 10px;
                        line-height: 1.7;
                        padding: 14px 28px;
                      "
                    >
                      <a
                        href="{$tempAccessUrl}"
                        target="_blank"
                        style="
                          display: inline-block;
                          min-width: 260px;
                          text-align: center;
                          font-size: 16px;
                          font-weight: 600;
                          color: #ffffff;
                          text-decoration: none;
                        "
                      >
                        Review Request Details
                      </a>
                    </td>
                  </tr>
              </table>
                            <!-- footer text -->
              <table
                  bgcolor="#f7f6fd"
                  role="presentation"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="margin: 18px auto 0 auto; width: 100%; background: #f7f6fd">
                  <tr>
                    <td>
                      <table
                        role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                          border-top: 1px solid #e1e9f5;
                          border-radius: 0 0 14px 14px;
                        "
                      >
                        <tr>
                          <td
                            align="center"
                            style="
                              padding: 18px 20px;
                              font-size: 13px;
                              color: #6a7a94;
                            "
                          >
                            This is an automated notification from the Web JMR
                            System.
                          </td>
                        </tr>
                      </table>
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
        $embeddedImages = $payload['embedded_images'] ?? [];

        error_log('sendSystemEmail(decision): payload from=' . $from . ', to=' . json_encode($to) . ', subject=' . $subject);
        error_log('sendSystemEmail(decision): payload cc=' . json_encode($ccList));

        if ($from === '' || $to === '' || $subject === '' || $html === '') {
            error_log('sendSystemEmail(decision) skipped: missing required payload fields.');
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

        error_log('sendSystemEmail(decision): attempting SMTP send to=' . json_encode($to));

        $mail->send();

        error_log('sendSystemEmail(decision): mail sent successfully to=' . json_encode($to));
        return true;
    } catch (Exception $e) {
        error_log('PHPMailer send failed (decision): ' . $e->getMessage());
        return false;
    } catch (Throwable $e) {
        error_log('sendSystemEmail(decision) fatal: ' . $e->getMessage());
        return false;
    }
}

function formatRequestedMonthEmailLabel(string $requestedMonth): string
{
    if ($requestedMonth === '') {
        return '—';
    }

    $date = DateTime::createFromFormat('!Y-m', $requestedMonth);
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