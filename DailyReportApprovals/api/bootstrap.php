<?php

date_default_timezone_set('Asia/Manila');

define('WEBJMR_ENABLE_EMAILS', false);

require_once __DIR__ . '/../../vendor/autoload.php';

require_once __DIR__ . '/../../dbconn/dbconnectwebjmr.php';
require_once __DIR__ . '/../../dbconn/dbconnectnew.php';
require_once __DIR__ . '/../../dbconn/dbconnectkdtph.php';

require_once __DIR__ . '/../services/authService.php';
require_once __DIR__ . '/../services/emailService.php';
require_once __DIR__ . '/../services/employeeService.php';
require_once __DIR__ . '/../services/groupService.php';
require_once __DIR__ . '/../services/permissionService.php';
require_once __DIR__ . '/../services/unlockRequestService.php';


require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/helpers.php';