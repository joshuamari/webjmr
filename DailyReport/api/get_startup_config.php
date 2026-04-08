<?php

require_once __DIR__ . '/bootstrap.php';

try {
    $systemIds = getSystemIds($connwebjmr);

    $startupConfig = array_merge($systemIds, [
        'kdtwAccess' => $KDTW_ACCESS,
        'managementPositions' => $MANAGEMENT_POSITIONS,
        'devs' => $DEVS,
        'noMoreInputItems' => $NO_MORE_INPUT_ITEM_IDS,
    ]);

    jsonSuccess($startupConfig);
} catch (Throwable $e) {
    jsonError('Failed to load startup config.', 500);
}