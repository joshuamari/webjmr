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
$hiramEntries=array();
$proj=' AND dr.fldProject NOT IN (';
foreach($defaultProjID AS $dpi){
        $proj.="'$dpi',";
}
$proj=rtrim($proj,",");
$projsQ="SELECT DISTINCT(dr.fldProject) FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID WHERE (dr.fldProject IN (SELECT fldID FROM projectstable WHERE fldGroup='$rawGetGroup') OR fldTrGroup='$rawGetGroup') $dateCompare";
$projStmt=$connwebjmr->prepare($projsQ);
$projStmt->execute();
if($projStmt->rowCount()>0){
    $projsArr=$projStmt->fetchAll();
    foreach($projsArr AS $projs){
        $projID=$projs['fldProject'];
        $proj.="'$projID',";
    }
    $proj=rtrim($proj,",");
}
$proj.=")";


#endregion

#region main

$grpMem="";
$grpMemQ="SELECT DISTINCT(fldEmployeeNum) FROM emp_prof WHERE fldGroup='$rawGetGroup'";
$grpMemStmt=$connkdt->prepare($grpMemQ);
$grpMemStmt->execute();
if($grpMemStmt->rowCount()>0){
    $grpMemArr=$grpMemStmt->fetchAll();
    $grpMem.=" AND dr.fldEmployeeNum IN(";
    foreach($grpMemArr AS $gMem){
        $grpMem.="'".$gMem['fldEmployeeNum']."',";
    }
    $grpMem=rtrim($grpMem,",");
}
$grpMem.=")";
//emp#||dbIndex||duration
$hiramEntQ="SELECT SUM(fldDuration) AS totalHrs,dr.fldEmployeeNum,pt.fldOrder,dl.fldCode AS locCode,dr.fldProject FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN dispatch_locations AS dl ON dr.fldLocation=dl.fldID WHERE ((dr.fldGroup='$rawGetGroup' AND dr.fldTrGroup IS NOT NULL) OR dr.fldEmployeeNum IS NOT NULL $proj $grpMem) $dateCompare  GROUP BY dr.fldProject,dr.fldEmployeeNum,locCode";
$hiramEntStmt=$connwebjmr->prepare($hiramEntQ);
$hiramEntStmt->execute();
if($hiramEntStmt->rowCount()>0){
    $hiramEntArr=$hiramEntStmt->fetchAll();
    foreach($hiramEntArr AS $hiramEnt){
        $pOrder = $hiramEnt['fldOrder'];
        $projID=$hiramEnt['fldProject'];
        $enum = $hiramEnt['fldEmployeeNum'];
        $locCode = ($hiramEnt['locCode']==0) ? 'P':'J';
        $thrs = ((float)$hiramEnt['totalHrs'])/60;
        array_push($hiramEntries,"$enum||$projID-$locCode||$thrs");
    }
}


#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($hiramEntries);
// echo $hiramEntQ;
?>