<?php
function getUnlockRequestToEmails(): array
{
    global $connkdt;

    $query = "
        SELECT kl.`fldOutlook` AS email
        FROM `user_permissions` up
        INNER JOIN `kdtlogin` kl
            ON kl.`fldEmployeeNum` = up.`fldEmployeeNum`
        WHERE up.`permission_id` = 53
          AND kl.`fldOutlook` IS NOT NULL
          AND kl.`fldOutlook` != ''
    ";

    $stmt = $connkdt->prepare($query);
    $stmt->execute();

    return normalizeEmailList(
        $stmt->fetchAll(PDO::FETCH_COLUMN)
    );
}
function getUnlockRequestCcEmails(int $requestedBy, int $employeeNum): array
{
    global $connkdt;

    $emails = [];

    // ===== requestor email =====
    $stmt1 = $connkdt->prepare("
        SELECT `fldOutlook`
        FROM `kdtlogin`
        WHERE `fldEmployeeNum` = :emp
          AND `fldOutlook` IS NOT NULL
          AND `fldOutlook` != ''
        LIMIT 1
    ");
    $stmt1->execute([':emp' => $requestedBy]);
    $reqEmail = $stmt1->fetchColumn();

    if ($reqEmail) {
        $emails[] = $reqEmail;
    }

    // ===== requested employee email =====
    if ($employeeNum !== $requestedBy) {
        $stmt2 = $connkdt->prepare("
            SELECT `fldOutlook`
            FROM `kdtlogin`
            WHERE `fldEmployeeNum` = :emp
              AND `fldOutlook` IS NOT NULL
              AND `fldOutlook` != ''
            LIMIT 1
        ");
        $stmt2->execute([':emp' => $employeeNum]);
        $empEmail = $stmt2->fetchColumn();

        if ($empEmail) {
            $emails[] = $empEmail;
        }
    }

    return normalizeEmailList($emails);
}
function getUnlockRequestEmailRecipients(int $requestedBy, int $employeeNum): array
{
    $to = getUnlockRequestToEmails();
    $cc = getUnlockRequestCcEmails($requestedBy, $employeeNum);

    // optional: avoid duplicates between TO and CC
    $cc = array_values(array_diff($cc, $to));

    return [
        'to' => $to,
        'cc' => $cc,
    ];
}

function normalizeEmailList(array $emails): array
{
    $clean = [];

    foreach ($emails as $email) {
        $email = trim((string) $email);

        if ($email === '') {
            continue;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            continue;
        }

        $clean[strtolower($email)] = $email;
    }

    return array_values($clean);
}