<?php
#region Require Database Connections
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$yearMonth = date("Y-04");
if(!empty($_POST['monthSel'])){
    $yearMonth = $_POST['monthSel'];
}
$empStatement = "''";
$employeeArray = array(464,465,487);
if(!empty($employeeArray)){
    $empStatement = '';
    // $employeeArray = $_POST['empArray'];
    foreach($employeeArray AS $emp){
        $empStatement .= $emp . ",";
    }
    $empStatement = rtrim($empStatement, ",");
}
$entriesArray = array();
#endregion

#region main
$entriesQuery = "SELECT dr.fldProject AS projID, pt.fldProject AS projName, dr.fldEmployeeNum AS eNum, dr.fldDate AS eDate, dr.fldDuration AS eMinutes, dr.fldMHType AS eMHT FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject = pt.fldID WHERE dr.fldEmployeeNum IN ($empStatement) AND dr.fldDate LIKE :yearMonth ";
$entriesStmt = $connwebjmr -> prepare($entriesQuery);
$entriesStmt -> execute([":yearMonth" => "$yearMonth%"]);
if($entriesStmt -> rowCount()>0){
    $entriesArr = $entriesStmt -> fetchAll();
    foreach($entriesArr AS $entries){
        $output = array();
        $output += ["pIndex" => $entries['projID']];
        $output += ["pName" => $entries['projName']];
        $output += ["empNum" => $entries['eNum']];
        $rawDate = $entries['eDate'];
        $entryDay = date("d",strtotime($rawDate));
        $output += ["entryDate" => $entryDay];
        $rawMinutes = $entries['eMinutes'];
        $entryHours = $rawMinutes / 60;
        $output += ["hours" => $entryHours];
        $output += ["OT" => $entries['eMHT']];
        array_push($entriesArray,$output);

    }
}
#endregion

#region function

#endregion
echo "<pre>";
echo json_encode($entriesArray);
echo "</pre>";