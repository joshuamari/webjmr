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

    // CC only the requester when the requester is different from the employee.
    $requesterEmail = trim((string)($emailMap[$requesterId] ?? ''));
    if ($requesterId !== '' && $requesterId !== $employeeId && $requesterEmail !== '') {
        $cc[] = $requesterEmail;
    }

    $cc = array_values(array_unique($cc));

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
        'tempAccessUrl' => 'http://kdt-ph/webJMR/DailyReportApprovals/',
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
    $isApproved = $status === 'approved';

    $employeeName = htmlspecialchars((string)($data['employeeName'] ?? '—'));
    $employeeSurname = htmlspecialchars((string)($data['employeeSurname'] ?? ''));
    $requestedByName = htmlspecialchars((string)($data['requestedByName'] ?? '—'));
    $requestedMonthLabel = htmlspecialchars((string)($data['requestedMonthLabel'] ?? '—'));
    $approverName = htmlspecialchars((string)($data['approverName'] ?? '—'));
    $actionAtLabel = htmlspecialchars((string)($data['actionAtLabel'] ?? '—'));
    $expirationLabel = htmlspecialchars((string)($data['expirationLabel'] ?? '—'));
    $tempAccessUrl = htmlspecialchars((string)($data['tempAccessUrl'] ?? '#'));
    
    $backgroundImg = '../public/bg.png';

    $pendingIcon = '<img src="../public/pending.png" width="20" height="20" alt=""  style="display:block; width:20px; height:20px; border:0;">';

    $personIcon = '<img src="../public/user.png" width="20" height="20" alt=""  style="display:block; width:20px; height:20px; border:0;">';

    $calendarIcon = '<img src="../public/calendar.png" width="20" height="20" alt=""    style="display:block; width:20px; height:20px; border:0;">';

    $clockIcon = '<img src="../public/clock.png" width="20" height="20" alt="" style="display:block; width:20px; height:20px; border:0;">';

    $infoIcon = '<img src="../public/info.png" width="20" height="20" alt=""  style="display:block; width:20px; height:20px; border:0;">';
    

    $title = $isApproved
        ? 'Access Request Approved'
        : 'Access Request Denied';

    $statusChipBg = $isApproved ? '#e9f8ef' : '#fdecec';
    $statusChipColor = $isApproved ? '#1f9d55' : '#d64545';
    $statusText = $isApproved ? 'APPROVED' : 'DENIED';

    $headlineCopy = $isApproved
        ? "You can now access and update the Daily Report for <strong>{$requestedMonthLabel}</strong>."
        : "The temporary access request for the Daily Report for <strong>{$requestedMonthLabel}</strong> was not approved.";

		


    $statusCopy ="";
    if($isApproved && $expirationLabel !== '—'){
        $statusCopy = "
        <td
                            style=\"margin-bottom: 18px;
                              padding: 16px 18px;
                              background: #eff7ee;
                              border: 1px solid #d7ead3;
                            \"
                            colspan=\"2\"
                          >
                            <div style=\"font-size:13px; color:#4b7d58; font-weight:700; letter-spacing:0.2px; margin-bottom:6px;\">
                                VALID UNTIL
                            </div>
                            <div style=\"font-size:22px; font-weight:700; color:#1f9d55;\">
                                {$expirationLabel}
                            </div>
                        </td>";
    }else{
			$statusCopy = 
			"<td style=\"margin-bottom: 18px; padding: 16px 18px; background: #f7efee; border: 1px solid #ebd4d1; \"
      colspan=\"2\"
      >
        <div
          style=\"
            font-size: 18px;
            font-weight: 700;
            color: #d64545;
            padding: 12px 16px;
          \"
        >
          DENIED
        </div>
      </td>";
		}

    $urgentBox = '';
    if ($isApproved) {
        $urgentBox = "
            <table
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
                  \"
                >
                  <div
                    style=\"
                      margin: 18px 0;
                      border: 1px solid #f5d7a1;
                      background: #fff6e7;
                      border-radius: 14px;
                      overflow: hidden;
                    \"
                  >
                    <div
                      style=\"
                        padding: 14px 18px;
                        border-bottom: 1px solid #f2dfbb;
                        color: #7a4b00;
                        font-weight: 700;
                        font-size: 14px;
                      \"
                    >
                      IMPORTANT
                    </div>
                    <div
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
                    </div>
                  </div>
                </table>
        ";
    } else {
      $urgentBox = "
        <table
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
         \"
        >
          <div
            style=\"
              margin: 18px 0;
              border: 1px solid #f5d7a1;
              background: #fff6e7;
              border-radius: 14px;
              overflow: hidden;
            \"
          >
           <div
             style=\"
               padding: 14px 18px;
               border-bottom: 1px solid #f2dfbb;
               color: #7a4b00;
               font-weight: 700;
               font-size: 14px;
             \"
           >
             NOTICE
           </div>
            <div
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
            </div>
          </div>
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
  <table  role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eeedf8; margin:0; padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="840" cellpadding="0" cellspacing="0" border="0" style="width:840px; max-width:840px; background:#f7f6fd; border:1px solid #d9ddf1; border-radius:22px; overflow:hidden;"
				>
          <!-- HEADER     -->
          <tr>
            <td style="padding:24px 28px 22px 28px; background-color:#4F78D9; background-image:url('{$backgroundImg}');background-repeat:no-repeat;background-position:right center; background-size:cover;"
						>
                          
              <div style="font-size:15px; color:#EAF1FF; margin-bottom:10px;">
								Web JMR System
							</div>

              <div style="font-size:28px; line-height:1.25; font-weight:500; color:#FFFFFF;margin-bottom:10px;">
								{$title}
							</div>
              <div style="font-size:15px; line-height:1.6; color:#EAF1FF; ">
              	Temporary Daily Report access request update
              </div>
                         
            </td>
          </tr>
          
          <tr>
						<!-- TOP TEXT -->
            <td style="padding:30px 36px 30px 36px; ">
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
                role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #d9ddf1; border-radius: 16px;overflow: hidden; background: #ffffff;">
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
							<!-- CTA button -->
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
              
							<!-- footer text -->
             <table
                  role="presentation"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="margin: 18px auto 0 auto; width: 100%"
                >
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
