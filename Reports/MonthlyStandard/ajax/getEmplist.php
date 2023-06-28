<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$yearMonth = date("Y-m-01");
if(!empty($_POST['monthSel'])){
    $yearMonth = $_POST['monthSel'] . '-01';
}
// $groupSel = NULL;
$groupSel = 'SYS';
if(!empty($_POST['groupSel'])){
    $groupSel = $_POST['groupSel'];
}
$employeeArray = array();
#endregion

#region main
$empQuery = "SELECT fldEmployeeNum, CONCAT(fldSurname,', ',fldFirstname) AS ename FROM emp_prof WHERE fldGroup = :groupSel AND (fldResignDate IS NULL OR fldResignDate > :monthSel) AND fldNick<>''";
$empStmt = $connkdt -> prepare($empQuery);
$empStmt -> execute([":groupSel" => $groupSel, ":monthSel" => $yearMonth]);
if($empStmt->rowCount()>0){
    $empArr = $empStmt->fetchAll();
    foreach($empArr AS $emps){
        $output = array();
        $output+=["empNum"=>$emps['fldEmployeeNum']];
        $output+=["empName"=>$emps['ename']];
        array_push($employeeArray,$output);
    }
}

#endregion

#region function

#endregion

echo "<pre>";
echo json_encode($employeeArray);
echo "</pre>";