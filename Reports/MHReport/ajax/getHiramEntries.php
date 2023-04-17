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
$getGroup='';
if(!empty($_POST['getGroup'])){
    $getGroup=$_POST['getGroup'];
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
$projsQ="SELECT DISTINCT(dr.fldProject) FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID WHERE (dr.fldProject IN (SELECT fldID FROM projectstable WHERE fldGroup=:getGroup)) $dateCompare GROUP BY dr.fldProject,dr.fldLocation";
$projStmt=$connwebjmr->prepare($projsQ);
$projStmt->execute([":getGroup"=>$getGroup]);
if($projStmt->rowCount()>0){
    $projsArr=$projStmt->fetchAll();
    foreach($projsArr AS $projs){
        $projID=$projs['fldProject'];
        $proj.="'$projID',";
    }
    $proj=rtrim($proj,",");
}
$proj.=")";

$grpMem="";
$grpMemQ="SELECT DISTINCT(fldEmployeeNum) FROM emp_prof WHERE fldGroup=:getGroup";
$grpMemStmt=$connkdt->prepare($grpMemQ);
$grpMemStmt->execute([":getGroup"=>$getGroup]);
if($grpMemStmt->rowCount()>0){
    $grpMemArr=$grpMemStmt->fetchAll();
    $grpMem.=" AND dr.fldEmployeeNum IN(";
    foreach($grpMemArr AS $gMem){
        $grpMem.="'".$gMem['fldEmployeeNum']."',";
    }
    $grpMem=rtrim($grpMem,",");
}
$grpMem.=")";
#endregion

#region main
//emp#||dbIndex||duration
$hiramEntQ="SELECT SUM(fldDuration) AS totalHrs,dr.fldEmployeeNum,pt.fldOrder,dl.fldCode AS locCode,pt.fldProject FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN dispatch_locations AS dl ON dr.fldLocation=dl.fldID WHERE (dr.fldEmployeeNum IS NOT NULL $proj $grpMem) $dateCompare  GROUP BY dr.fldProject,dr.fldEmployeeNum";
$hiramEntStmt=$connwebjmr->prepare($hiramEntQ);
$hiramEntStmt->execute();
if($hiramEntStmt->rowCount()>0){
    $hiramEntArr=$hiramEntStmt->fetchAll();
    foreach($hiramEntArr AS $hiramEnt){
        $pOrder = $hiramEnt['fldOrder'];
        $enum = $hiramEnt['fldEmployeeNum'];
        $locCode = ($hiramEnt['locCode']==0) ? 'P':'J';
        $thrs = ((float)$hiramEnt['totalHrs'])/60;
        array_push($hiramEntries,"$enum||$pOrder-$locCode||$thrs");
    }
}

#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($hiramEntries);
// echo $hiramEntQ;
?>