<?php
require_once __DIR__ . '/bootstrap.php';
mhRequireConnections();

$result = [
    'isSuccess' => false,
    'message' => 'No access',
];

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
        $result['data'] = $login['data'];
        $result['isSuccess'] = true;
        $result['message'] = 'Access';
    }

    mhJsonHeaders();
    echo json_encode($result);
} catch (Throwable $e) {
    mhJsonFail($e);
}
