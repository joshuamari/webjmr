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

    $ac = rdHasAccess($login['data']['id']);
    if ($ac) {
        $result['data'] = getGroups($login['data']['id'], RD_ALL_GROUP_ACCESS);
        $result['isSuccess'] = true;
        $result['message'] = 'Groups fetched';
    }

    rdJsonOk($result);
} catch (Throwable $e) {
    rdJsonFail($e);
}
