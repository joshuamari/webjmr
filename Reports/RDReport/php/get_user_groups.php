<?php
require_once __DIR__ . '/bootstrap.php';
rdRequireConnections();

$result = [
    'isSuccess' => false,
    'message' => 'No access',
];

try {
    $login = checkAuthentication();
    if ($login['isSuccess'] == false) {
        $result['message'] = $login['message'];
        rdJsonOk($result);
    }

    $reportType = rdRequestedType();
    $ac = rdHasAccess($login['data']['id'], $reportType);
    if ($ac) {
        $result['data'] = getGroups(
            $login['data']['id'],
            rdAllGroupAccessPermissionId($reportType)
        );
        $result['isSuccess'] = true;
        $result['message'] = 'Groups fetched';
    }

    rdJsonOk($result);
} catch (Throwable $e) {
    rdJsonFail($e);
}
