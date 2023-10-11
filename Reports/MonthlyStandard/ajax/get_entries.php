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
$entriesQuery = "SELECT dr.fldProject AS projID, pt.fldProject AS projName, dr.fldEmployeeNum AS eNum, dr.fldDate AS eDate, SUM(dr.fldDuration) AS projMinute, dr.fldMHType AS eMHT, dr.fldItem AS itemID FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject = pt.fldID WHERE $dateCompare $empStatement $ogp $locStatement GROUP BY dr.fldProject,dr.fldMHType,dr.fldDate,dr.fldEmployeeNum ORDER BY CASE WHEN pt.fldGroup IS NULL THEN 1 ELSE 0 END, pt.fldProject";
$entriesStmt = $connwebjmr->prepare($entriesQuery);
$entriesStmt->execute();
if ($entriesStmt->rowCount() > 0) {
    $entriesArr = $entriesStmt->fetchAll();
    foreach ($entriesArr as $entries) {
        $output = array();
        $output += ["pIndex" => $entries['projID']];
        $output += ["pName" => $entries['projName']];
        $output += ["empNum" => $entries['eNum']];
        $rawDate = $entries['eDate'];
        $entryDay = date("d", strtotime($rawDate));
        $output += ["entryDate" => $entryDay];
        $rawMinutes = $entries['projMinute'];
        $entryHours = $rawMinutes / 60;
        $output += ["hours" => $entryHours];
        $output += ["OT" => ($entries['eMHT'] == 1) ? TRUE : FALSE];
        $output += ["iIndex" => $entries['itemID']];
        array_push($entriesArray, $output);
    }
}
#endregion

#region function

#endregion
echo json_encode($entriesArray);
