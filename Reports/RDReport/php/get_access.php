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
        $result['data'] = $login['data'];
        $result['isSuccess'] = true;
        $result['message'] = 'Access';
    }

    rdJsonOk($result);
} catch (Throwable $e) {
    rdJsonFail($e);
}
