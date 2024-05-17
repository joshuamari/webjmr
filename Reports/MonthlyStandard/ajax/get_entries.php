<?php
#region Require Database Connections
require_once '../Includes/dbconnectwebjmr.php';
require_once '../Includes/globalFunctions.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$groupSel = NULL;
if (!empty($_POST['groupSel'])) {
    $groupSel = $_POST['groupSel'];
}
$yearMonth = date("Y-04");
if (!empty($_POST['monthSel'])) {
    $yearMonth = $_POST['monthSel'];
}
$empStatement = "";
$employeeArray = array();
if (!empty($_POST['empArray'])) {
    $employeeArray = $_POST['empArray'];
    $implodeString = implode("','", $employeeArray);
    $empStatement = "AND dr.fldEmployeeNum IN ('" . $implodeString . "')";
}
$cutOff = "1";
if (isset($_REQUEST['getHalfSel'])) {
    $cutOff = $_REQUEST['getHalfSel'];
}
$location = NULL;
$locStatement = " AND fldLocation IN (1,2)"; //KDT/WFH
if (!empty($_POST['location'])) {
    $location = $_POST['location'];
    $locStatement = " AND fldLocation = '$location'";
}

$firstDay = getFirstday($yearMonth, $cutOff);
$lastDay = getLastday($yearMonth, $cutOff, $firstDay);
$dateCompare = "dr.fldDate >= '$firstDay' AND dr.fldDate<'$lastDay'";
$entriesArray = array();
$ogp = " AND (pt.fldGroup = '$groupSel' OR (pt.fldGroup IS NULL AND dr.fldGroup = '$groupSel'))";
if (!empty($_POST['getOGP'])) {
    if (filter_var($_POST['getOGP'], FILTER_VALIDATE_BOOLEAN)) {
        $ogp = '';
    }
}
#endregion

#region main
$entriesQuery = "SELECT dr.fldProject AS projID, pt.fldProject AS projName, dr.fldEmployeeNum AS eNum, dr.fldDate AS eDate, SUM(dr.fldDuration) AS projMinute, dr.fldMHType AS eMHT, dr.fldItem AS itemID,CASE WHEN pt.fldGroup IS NULL OR pt.fldGroup='$groupSel' THEN 0 ELSE pt.fldGroup END AS isHiram FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject = pt.fldID WHERE $dateCompare $empStatement $ogp $locStatement GROUP BY dr.fldProject,dr.fldMHType,dr.fldDate,dr.fldEmployeeNum ORDER BY CASE WHEN pt.fldGroup IS NULL THEN 1 ELSE 0 END, pt.fldProject";
$entriesStmt = $connwebjmr->prepare($entriesQuery);
$entriesStmt->execute();
if ($entriesStmt->rowCount() > 0) {
    $entriesArr = $entriesStmt->fetchAll();
    // die(json_encode($entriesArr));
    foreach ($entriesArr as $entries) {
        $isHiram = '';
        if ($entries['isHiram']) {
            $isHiram = " (" . $entries['isHiram'] . ")";
        }
        // $output = array();
        // $output += ["pIndex" => $entries['projID']];
        // $output += ["pName" => $entries['projName'] . $isHiram];
        // $output += ["empNum" => $entries['eNum']];
        // $rawDate = $entries['eDate'];
        // $entryDay = date("d", strtotime($rawDate));
        // $output += ["entryDate" => $entryDay];
        // $rawMinutes = $entries['projMinute'];
        // $entryHours = $rawMinutes / 60;
        // $output += ["hours" => $entryHours];
        // $output += ["OT" => ($entries['eMHT'] == 1) ? TRUE : FALSE];
        // $output += ["iIndex" => $entries['itemID']];
        // array_push($entriesArray, $output);
        #region new fetch
        $employee_number = $entries['eNum'];
        $fullname = getName($employee_number);
        $project_name = $entries['projName'] . $isHiram;
        $project_id = $entries['projID'];
        $item_id = $entries['itemID'];
        $rawDate = $entries['eDate'];
        $rawMinutes = $entries['projMinute'];
        $entryHours = $rawMinutes / 60;
        $isOT = ($entries['eMHT'] == 1) ? TRUE : FALSE;
        $isLeave = ($entries['projID'] == 6) ? TRUE : FALSE;
        $entryDay = date("d", strtotime($rawDate));
        $entryDates[] = array(
            "entryDate" => $entryDay,
            "hours" => $entryHours
        );
        $entriesArray[$employee_number]["firstName"] = $fullname["firstName"];
        $entriesArray[$employee_number]["lastName"] = $fullname["lastName"];
        $entriesArray[$employee_number]["empId"] = $employee_number;

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
                'hours' => $entryHours
            ];
        } else {
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
                    'hours' => $entryHours
                ];
            } else {
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
                    'hours' => $entryHours
                ];
            }
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
#endregion

#region function

#endregion
echo json_encode($entriesArray);
