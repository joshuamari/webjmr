<?php
require_once __DIR__ . '/bootstrap.php';
mhRequireConnections();

$result = [
    'isSuccess' => false,
    'message' => 'No access',
];
$mhAllGroupAccess = 51;

try {
    $login = checkAuthentication();
    if ($login['isSuccess'] == false) {
        $result['message'] = $login['message'];
        mhJsonHeaders();
        echo json_encode($result);
        exit(0);
    }

    $ac = getMHReportAccess($login['data']['id']);
    if ($ac) {
        $result['data'] = getGroups($login['data']['id'], $mhAllGroupAccess);
        $result['isSuccess'] = true;
        $result['message'] = 'Groups fetched';
    }

    mhJsonHeaders();
    echo json_encode($result);
} catch (Throwable $e) {
    mhJsonFail($e);
}
