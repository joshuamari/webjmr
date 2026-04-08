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
$groupSelected = NULL;
if (!empty($_POST['groupSel'])) {
    $groupSel = $_POST['groupSel'];
}
$yearMonth = date("Y-04");
if (!empty($_POST['monthSel'])) {
    $yearMonth = $_POST['monthSel'];
}
$employeeStatement = "";
$empNameStatement = "";
$employees = [];
if (!empty($_POST['empArray'])) {
    $employeeArray = json_decode($_POST['empArray']);
    $implodeString = implode("','", $employeeArray);
    $empStatement = "AND eNum IN ('" . $implodeString . "')";
    $empNameStatement = "'" . $implodeString . "'";
}
$cutOff = "1";
if (isset($_REQUEST['getHalfSel'])) {
    $cutOff = $_REQUEST['getHalfSel'];
}
$location = 1;
$locStatement = " AND projLocation IN (1,2)"; //KDT/WFH
if (!empty($_POST['location'])) {
    $location = $_POST['location'];
    $locStatement = " AND projLocation = '$location'";
}
if($_POST['location']==-1){
    $locStatement = " AND projLocation IN (1,8)";
}
$firstDay = getFirstday($yearMonth, $cutOff);
$lastDay = getLastday($yearMonth,$cutOff,$firstDay);
$dateRangeStatement = "eDate >= '$firstDay' AND eDate<'$lastDay'";
$includeOGP = false;
if (isset($_POST['getOGP']) && filter_var($_POST['getOGP'], FILTER_VALIDATE_BOOLEAN) === true) {
    $includeOGP = true;
}
$employeeNames=[];
$entriesArray = array();
$empNameAssoc = [];
#endregion

#region getnames
$empNameQ = "SELECT id emp_num, firstname, surname FROM employee_list WHERE id IN ($empNameStatement)";
$empNameStmt = $connnew -> prepare($empNameQ);
$empNameStmt->execute();
$empNameArr = $empNameStmt->fetchAll();
foreach ($empNameArr as $row) {
    $empNameAssoc[$row['emp_num']] = [
        'firstName' => $row['firstname'],
        'lastName' => $row['surname'],
    ];
}
#endregion

#region main query
$start = microtime(true);
$entriesQuery = "SELECT
  projLocation,
  projID,
  projName,
  eNum,
  eDate,
  SUM(projMinute) AS projMinute,
  eMHT,
  itemID,
  IF(projGroup IS NULL OR projGroup = :groupSel, 0, projGroup) AS isHiram
FROM mos_report
WHERE $dateRangeStatement $empStatement $locStatement
GROUP BY projID, eMHT, eDate, eNum
ORDER BY IF(projGroup IS NULL, 1, 0), projName";
$entriesStmt = $connwebjmr->prepare($entriesQuery);
$entriesStmt->execute([":groupSel"=>$groupSel]);
if ($entriesStmt->rowCount() > 0) {
    $entriesArr = $entriesStmt->fetchAll();
    foreach ($entriesArr as $entries) {
        if (!$includeOGP && $entries['isHiram'] != 0) {
            continue;
        }
        $isHiram = '';
        $ogpLabel = '';
        if ($entries['isHiram']) {
            $isHiram = " (" . $entries['isHiram'] . ")";
            $ogpLabel = "[ogp]";
        }
        #region new fetch
        $employee_number = $entries['eNum'];
        // $fullname = getName($employee_number);
        $project_name =   $entries['projName'] . $isHiram . $ogpLabel;
        $project_id = $entries['projID'];
        $project_location = "";

        $item_id = $entries['itemID'];
        $rawDate = $entries['eDate'];
        $rawMinutes = $entries['projMinute'];
        $entryHours = $rawMinutes / 60;
        $isOT = ($entries['eMHT'] == 1) ? TRUE : FALSE;
        $isLeave = ($entries['projID'] == 6) ? TRUE : FALSE;
        $entryDay = date("d", strtotime($rawDate));
        $entryDates[] = array(
            "entryDate" => $entryDay,
            "hours" => $entryHours,
            "location" => $project_location
        );
        $entriesArray[$employee_number]["firstName"] = $empNameAssoc[$employee_number]['firstName'];
        $entriesArray[$employee_number]["lastName"] = $empNameAssoc[$employee_number]['lastName'];
        $entriesArray[$employee_number]["empId"] = $employee_number;

        if ($entries["projLocation"] === "1") {
            $project_location = "KDT";
        } else if ($entries["projLocation"] === "2") {
            $project_location = "WFH";
        } else if ($entries["projLocation"] === "8") {
            $project_location = "HWFH";
        }else {
            $project_location = "Dispatch";
        }

        if ($isOT) {
            if (!isset($entriesArray[$employee_number]["OTEntries"][$project_id])) {
                $entriesArray[$employee_number]["OTEntries"][$project_id] = [
                    "pName" => $project_name,
                    'dateEntries' => [],
                    "iIndex" => $item_id,
                ];
            }
            // Add the date and hours to the nested structure
            $entriesArray[$employee_number]["OTEntries"][$project_id]['dateEntries'][] = [
                'entryDate' => $entryDay,
                'hours' => $entryHours,
                "location" => $project_location
            ];
        }

        if ($isLeave) {
            if (!isset($entriesArray[$employee_number]["Leaves"][$project_id])) {
                $entriesArray[$employee_number]["Leaves"][$project_id] = [
                    "pName" => $project_name,
                    'dateEntries' => [],
                    "iIndex" => $item_id,
                ];
            }
            // Add the date and hours to the nested structure
            $entriesArray[$employee_number]["Leaves"][$project_id]['dateEntries'][] = [
                'entryDate' => $entryDay,
                'hours' => $entryHours,
                "location" => $project_location
            ];
        } 
        else {
            if (!isset($entriesArray[$employee_number]["RegularHourEntries"][$project_id])) {
                $entriesArray[$employee_number]["RegularHourEntries"][$project_id] = [
                    "pName" => $project_name,
                    'dateEntries' => [],
                    "iIndex" => $item_id,
                ];
            }
            // Add the date and hours to the nested structure
            $entriesArray[$employee_number]["RegularHourEntries"][$project_id]['dateEntries'][] = [
                'entryDate' => $entryDay,
                'hours' => $entryHours,
                "location" => $project_location
            ];
        }


        if (!array_key_exists("RegularHourEntries", $entriesArray[$employee_number])) {
            $entriesArray[$employee_number]["RegularHourEntries"] = [];
        }
        if (!array_key_exists("OTEntries", $entriesArray[$employee_number])) {
            $entriesArray[$employee_number]["OTEntries"] = [];
        }
        if (!array_key_exists("Leaves", $entriesArray[$employee_number])) {
            $entriesArray[$employee_number]["Leaves"] = [];
        }
        #endregion
    }
}
$end = microtime(true);
$duration = $end - $start;

// echo "Query took " . round($duration, 4) . " seconds";
#endregion

ob_start("ob_gzhandler");
echo json_encode($entriesArray);
ob_end_flush();