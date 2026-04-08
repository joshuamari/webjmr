<?php
#region database connections
require_once '../../../dbconn/dbconnectwebjmr.php';
require_once '../../../dbconn/dbconnectnew.php';
require_once '../../../global/globalFunctions.php';
#endregion

#region timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region variables
$groupSel = $_POST['groupSel'] ?? NULL;
$yearMonth = $_POST['monthSel'] ?? date("Y-04");
$cutOff = $_REQUEST['getHalfSel'] ?? "1";
$firstDay = getFirstday($yearMonth, $cutOff);
$lastDay = getLastday($yearMonth, $cutOff, $firstDay);
$dateRangeStatement = "eDate >= '$firstDay' AND eDate < '$lastDay'";

$empStatement = "";
$empNameStatement = "";
if (!empty($_POST['empArray'])) {
    $employeeArray = json_decode($_POST['empArray']);
    $implodeString = implode("','", $employeeArray);
    $empStatement = "AND eNum IN ('$implodeString')";
    $empNameStatement = "'$implodeString'";
}

$location = $_POST['location'] ?? null;
$locStatement = match(true) {
    $location == 0 => "AND projLocation IN (1,2)",
    $location == -1 => "AND projLocation IN (1,8)",
    default => "AND projLocation = '$location'"
};

$includeOGP = isset($_POST['getOGP']) && filter_var($_POST['getOGP'], FILTER_VALIDATE_BOOLEAN);
#endregion

#region employee names
$empNameAssoc = [];
if (!empty($empNameStatement)) {
    $empNameQ = "SELECT id emp_num, firstname, surname FROM employee_list WHERE id IN ($empNameStatement)";
    $empNameStmt = $connnew->prepare($empNameQ);
    $empNameStmt->execute();
    foreach ($empNameStmt->fetchAll() as $row) {
        $empNameAssoc[$row['emp_num']] = [
            'firstName' => $row['firstname'],
            'lastName' => $row['surname'],
        ];
    }
}
#endregion

#region query using vw_mos_report
$start = microtime(true);
$entriesArray = [];

$query = "
    SELECT *
    FROM vw_mos_report
    WHERE $dateRangeStatement $empStatement $locStatement
    ORDER BY IF(projGroup IS NULL, 1, 0), projName
";

$stmt = $connwebjmr->prepare($query);
$stmt->execute();

foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $entry) {
    $empNum = $entry['eNum'];
    $projID = $entry['projID'];
    $itemID = $entry['itemID'];
    $projName = $entry['projName'];
    $projGroup = $entry['projGroup'];
    $entryGroup = $entry['entryGroup'];

    $projLocation = match($entry['projLocation']) {
        "1" => "KDT",
        "2" => "WFH",
        "8" => "HWFH",
        default => "Dispatch"
    };

    $hours = $entry['projMinute'] / 60;
    $entryDay = date("d", strtotime($entry['eDate']));
    $isOT = ($entry['eMHT'] == 1);
    $isLeave = ($projID == 6);

    // Determine isHiram (exclude leaves from this check)
    $isHiram = false;
    if (!$isLeave) {
        $isHiram = (
            ($projGroup !== null && $projGroup !== $groupSel) || // project has different group
            ($projGroup === null && $entryGroup !== $groupSel)   // general project, check entryGroup
        );
    }

    // OGP filter logic
    if (!$includeOGP) {
        $shouldInclude = (
            ($projGroup === null && $entryGroup === $groupSel) ||
            ($projGroup !== null && $projGroup === $groupSel)
        );
        if (!$shouldInclude) {
            continue;
        }
    }

    // Build label
    $projectLabel = $projName;
    if ($isHiram) {
        if ($projGroup !== null) {
            $projectLabel .= " ({$projGroup})[ogp]";
        } else {
            $projectLabel .= " [ogp]";
        }
    }

    // Init employee block
    $entriesArray[$empNum] ??= [
        "firstName" => $empNameAssoc[$empNum]['firstName'] ?? '',
        "lastName" => $empNameAssoc[$empNum]['lastName'] ?? '',
        "empId" => $empNum,
        "RegularHourEntries" => [],
        "OTEntries" => [],
        "Leaves" => []
    ];

    // Build date entry with iIndex per entry
    $entryHoursObj = [
        "entryDate" => $entryDay,
        "hours" => $hours,
        "location" => $projLocation,
        "iIndex" => $itemID
    ];

    // Insert into appropriate category
    if ($isLeave) {
        $entriesArray[$empNum]["Leaves"][$projID] ??= [
            "pName" => $projectLabel,
            "dateEntries" => []
        ];
        $entriesArray[$empNum]["Leaves"][$projID]["dateEntries"][] = $entryHoursObj;
    } else {
        // Regular
        $entriesArray[$empNum]["RegularHourEntries"][$projID] ??= [
            "pName" => $projectLabel,
            "dateEntries" => []
        ];
        $entriesArray[$empNum]["RegularHourEntries"][$projID]["dateEntries"][] = $entryHoursObj;

        // If OT, add also to OTEntries
        if ($isOT) {
            $entriesArray[$empNum]["OTEntries"][$projID] ??= [
                "pName" => $projectLabel,
                "dateEntries" => []
            ];
            $entriesArray[$empNum]["OTEntries"][$projID]["dateEntries"][] = $entryHoursObj;
        }
    }
}
$end = microtime(true);
#endregion

ob_start("ob_gzhandler");
echo json_encode($entriesArray);
ob_end_flush();
