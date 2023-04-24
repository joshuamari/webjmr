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
    if(in_array($rawGetGroup,$mgaU)){
        $getGroups=$industrialB;
    }
    else{
        array_push($getGroups,$rawGetGroup);
    }
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
$mgaGroup="(";
foreach($getGroups AS $gps){
    $mgaGroup.="'$gps',";
}
$mgaGroup=rtrim($mgaGroup,',');
$mgaGroup.=")";
#endregion

#region main

$mgaEmp='';
$mgaEmpNgBU='';
$empNgBUQ="SELECT DISTINCT(fldEmployeeNum) FROM emp_prof WHERE fldGroup IN $mgaGroup AND fldNick<>''";
$empNgBUStmt=$connkdt->prepare($empNgBUQ);
$empNgBUStmt->execute();
if($empNgBUStmt->rowCount()>0){
    $mgaEmpNgBU.=" OR fldEmployeeNum IN (";
    $enbArr=$empNgBUStmt->fetchAll();
    foreach($enbArr AS $enbs){
        $mgaEmpNgBU.="'".$enbs['fldEmployeeNum']."',";
    }
    $mgaEmpNgBU=rtrim($mgaEmpNgBU,",");
    $mgaEmpNgBU.=")";
}
$empsQ="SELECT DISTINCT(fldEmployeeNum) FROM dailyreport WHERE (fldProject IN (SELECT fldID FROM projectstable WHERE fldGroup IN $mgaGroup) $mgaEmpNgBU OR fldTrGroup IN $mgaGroup) $dateCompare";
$empsStmt=$connwebjmr->prepare($empsQ);
$empsStmt->execute();
if($empsStmt->rowCount()>0){
    $mgaEmp.=" AND fldEmployeeNum IN (";
    $empsArr=$empsStmt->fetchAll();
    foreach($empsArr AS $emps){
        $mgaEmp.="'".$emps['fldEmployeeNum']."',";
    }
    $mgaEmp=rtrim($mgaEmp,",");
    $mgaEmp.=")";
}
//emp#||Name||Group and Desig
if(!empty($mgaEmp)){
    $elQ="SELECT fldEmployeeNum,CONCAT(fldSurname,', ',fldFirstname) AS ename,fldGroup,fldDesig FROM emp_prof WHERE fldNick<>'' $mgaEmp ORDER BY CASE WHEN fldGroup='$rawGetGroup' THEN 1 ELSE fldGroup END, CASE WHEN fldDesig='SM' THEN 1 ELSE 2 END,fldEmployeeNum";
    $elStmt=$connkdt->prepare($elQ);
    $elStmt->execute();
    if($elStmt->rowCount()>0){
        $elArr=$elStmt->fetchAll();
        foreach($elArr AS $el){
            $enum = $el['fldEmployeeNum'];
            $ename = $el['ename'];
            $egroup = $el['fldGroup'];
            $edesig = $el['fldDesig'];
            if(!in_array("$enum||$ename||$edesig of $egroup",$eList)){
                array_push($eList,"$enum||$ename||$edesig of $egroup");
            }
        }
    }
}



#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($eList);
// echo $empsQ;
?>