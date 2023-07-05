<?php
#region Require Database Connections
require_once "../Includes/dbconnectwebjmr.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$getDate=date("Y-m-d");
if(!empty($_POST['getDate'])){
    $getDate=$_POST['getDate'];
}
$empNum='';
if(!empty($_POST['empNum'])){
    $empNum=$_POST['empNum'];
}
$output=array();
$regularHr=0;
$otHr=0;
$leaveHr=0;
$amsHr=0;
#endregion

#region main
$regQ="SELECT COALESCE(SUM(fldDuration),0) AS projMinute FROM dailyreport WHERE fldDate='$getDate' AND fldEmployeeNum='$empNum' AND fldMHType=0";
$regStmt=$connwebjmr->query($regQ);
$regularHr=$regStmt->fetchColumn() / 60;
$otQ="SELECT COALESCE(SUM(fldDuration),0) AS projMinute FROM dailyreport WHERE fldDate='$getDate' AND fldEmployeeNum='$empNum' AND fldMHType=1";
$otStmt=$connwebjmr->query($otQ);
$otHr=$otStmt->fetchColumn() / 60;
$lvQ="SELECT COALESCE(SUM(fldDuration),0) AS projMinute FROM dailyreport WHERE fldDate='$getDate' AND fldEmployeeNum='$empNum' AND fldMHType=2";
$lvStmt=$connwebjmr->query($lvQ);
$leaveHr=$lvStmt->fetchColumn() / 60;
array_push($output,$regularHr,$otHr,$leaveHr,$amsHr);
#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($output);
?>