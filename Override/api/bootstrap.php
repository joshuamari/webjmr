<?php

date_default_timezone_set('Asia/Manila');

require_once __DIR__ . '/../../dbconn/dbconnectwebjmr.php';
require_once __DIR__ . '/../../dbconn/dbconnectnew.php';
require_once __DIR__ . '/../../dbconn/dbconnectkdtph.php';

require_once __DIR__ . '/../services/authService.php';
require_once __DIR__ . '/../services/permissionService.php';
require_once __DIR__ . '/../services/prevMonthAccessService.php';


require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/helpers.php';
require_once __DIR__ . '/../lib/lookups.php';