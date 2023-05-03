<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';
require_once '../Includes/globalFunctions.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$getGroups=array();
$rawGetGroup='';
if(!empty($_POST['getGroup'])){
    $rawGetGroup=$_POST['getGroup'];
}
$firstDay=date("Y-m-01");
$lastDay=date("Y-m-16");
$ymSel=$firstDay;
if(!empty($_REQUEST['getYMSel'])){
    $ymSel=$_REQUEST['getYMSel'];
}
$firstDay=date("Y-m-01",strtotime($ymSel));
$lastDay=date("Y-m-16",strtotime($ymSel));
$cutOff="1";
if(isset($_REQUEST['getHalfSel'])){
    $cutOff=$_REQUEST['getHalfSel'];
}
if($cutOff=="2"){
    $lastDay=date('Y-m-d',strtotime($firstDay.'+ 1 month'));
    $firstDay=date("Y-m-16",strtotime($ymSel));
}
if($cutOff=="3"){
    $lastDay=date('Y-m-d',strtotime($firstDay.'+ 1 month')); 
}
$dateCompare=" AND fldDate >= '$firstDay' AND fldDate<'$lastDay'";

$eList=array();
#endregion

#region main
$mgaEmpStmt='';
$mgaEmpNgBU="";
$empNgBUQ="SELECT DISTINCT(fldEmployeeNum) FROM emp_prof WHERE fldGroup='$rawGetGroup' AND fldNick<>'' AND fldActive=1 AND fldDesig<> CASE WHEN fldGroup<>'ADM' THEN 'DM' ELSE 'KDTP' END";
$empNgBUStmt=$connkdt->prepare($empNgBUQ);
$empNgBUStmt->execute();
if($empNgBUStmt->rowCount()>0){
    $mgaEmpNgBU.="(";
    $enbArr=$empNgBUStmt->fetchAll();
    foreach($enbArr AS $enbs){
        $mgaEmpNgBU.="'".$enbs['fldEmployeeNum']."',";
    }
    $mgaEmpNgBU=rtrim($mgaEmpNgBU,",");
    // $mgaEmpNgBU.=") AND (fldProject <> '$leaveID' AND fldGroup='$rawGetGroup'))";
    $mgaEmpNgBU.=")";
    $mgaEmpStmt="AND fldEmployeeNum NOT IN";
}
$empsQ="SELECT DISTINCT(fldEmployeeNum) FROM dailyreport WHERE (fldProject IN (SELECT fldID FROM projectstable WHERE fldGroup='$rawGetGroup') OR fldTrGroup='$rawGetGroup'  OR (fldProject='$mngProjID' AND fldGroup='$rawGetGroup')) $mgaEmpStmt $mgaEmpNgBU $dateCompare";
$empsStmt=$connwebjmr->prepare($empsQ);
$empsStmt->execute();
if($empsStmt->rowCount()>0){
    if(!empty($mgaEmpNgBU)){
        $mgaEmpNgBU=rtrim($mgaEmpNgBU,")");
        $mgaEmpNgBU.=",";
    }
    else{
        $mgaEmpNgBU="(";
    }
    $empsArr=$empsStmt->fetchAll();
    foreach($empsArr AS $emps){
        $mgaEmpNgBU.="'".$emps['fldEmployeeNum']."',";
    }
    $mgaEmpNgBU=rtrim($mgaEmpNgBU,",");
    $mgaEmpNgBU.=")";
}
//emp#||Name||Group and Desig

$elQ="SELECT ep.fldEmployeeNum,CONCAT(ep.fldSurname,', ',ep.fldFirstname) AS ename,ep.fldGroup,ep.fldDesig,kdtd.fldDeptCode FROM emp_prof AS ep LEFT OUTER JOIN departments AS kdtd ON ep.fldEmployeeNum=kdtd.fldManager WHERE ep.fldNick<>'' AND ep.fldEmployeeNum IN $mgaEmpNgBU ORDER BY CASE WHEN ep.fldDesig='SM' THEN 1 WHEN ep.fldDesig='DM' THEN 2 ELSE 3 END,CASE WHEN ep.fldGroup='$rawGetGroup' THEN 1 ELSE ep.fldGroup END,ep.fldEmployeeNum";
$elStmt=$connkdt->prepare($elQ);
$elStmt->execute();
if($elStmt->rowCount()>0){
    $elArr=$elStmt->fetchAll();
    foreach($elArr AS $el){
        $enum = $el['fldEmployeeNum'];
        $ename = $el['ename'];
        $egroup = $el['fldGroup'];
        $edesig = $el['fldDesig'];
        if($edesig=="DM"){
            $egroup=$el['fldDeptCode'];
        }
        if(!in_array("$enum||$ename||$edesig of $egroup",$eList)){
            array_push($eList,"$enum||$ename||$edesig of $egroup");
        }
    }
}




#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($eList);
// echo $elQ;
?>