<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion
#region Initialize Variables
$output="<option value='' selected disabled>Select...</option>";
$empNum='';
if(isset($_REQUEST['empNum'])){
    $empNum=$_REQUEST['empNum'];
}
$empGrp='';
if(isset($_REQUEST['empGrp'])){
    $empGrp=$_REQUEST['empGrp'];
}

#endregion
#region Query Members
$memQ = "SELECT * FROM emp_prof WHERE fldEmployeeNum<>'$empNum' AND fldGroup='$empGrp' AND fldActive=1 AND fldNick<>''";
$memStmt=$connkdt->query($memQ);
$memArr=$memStmt->fetchAll();
foreach($memArr AS $mem){
    $memberid=$mem['fldEmployeeNum'];
    $member=$mem['fldFirstname']." ".$mem['fldSurname'];
    $output .= "<option class='member' dataid='$memberid'>$member</option>";
}

#endregion
echo $output;
?>