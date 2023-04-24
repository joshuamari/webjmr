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
        $getGroups=$mgaU;
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
$hiram=array();
$mgaGroup="(";
foreach($getGroups AS $gps){
    $mgaGroup.="'$gps',";
}
$mgaGroup=rtrim($mgaGroup,',');
$mgaGroup.=")";
$mgaInd="(";
foreach($industrialB AS $ind){
    $mgaInd.="'$ind',";
}
$mgaInd=rtrim($mgaInd,',');
$mgaInd.=")";

$proj=' AND dr.fldProject NOT IN (';
foreach($defaultProjID AS $dpi){
    $proj.="'$dpi',";
}
$projsQ="SELECT DISTINCT(dr.fldProject) FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID WHERE (dr.fldProject IN (SELECT fldID FROM projectstable WHERE fldGroup IN $mgaGroup) OR fldTrGroup IN $mgaGroup) $dateCompare GROUP BY dr.fldProject,dr.fldLocation";
$projStmt=$connwebjmr->prepare($projsQ);
$projStmt->execute();
if($projStmt->rowCount()>0){
    $projsArr=$projStmt->fetchAll();
    foreach($projsArr AS $projs){
        $projID=$projs['fldProject'];
        $proj.="'$projID',";
    }
}
$proj=rtrim($proj,",");
$proj.=")";


#endregion

#region main

$grpMem="";
$grpMemQ="SELECT DISTINCT(fldEmployeeNum) FROM emp_prof WHERE fldGroup IN $mgaInd";
$grpMemStmt=$connkdt->prepare($grpMemQ);
$grpMemStmt->execute();
if($grpMemStmt->rowCount()>0){
    $grpMemArr=$grpMemStmt->fetchAll();
    $grpMem.=" AND dr.fldEmployeeNum IN(";
    foreach($grpMemArr AS $gMem){
        $grpMem.="'".$gMem['fldEmployeeNum']."',";
    }
    $grpMem=rtrim($grpMem,",");
    $grpMem.=")";
}
if(in_array($rawGetGroup,$mgaU)){
    $mgaGroup=$mgaInd;
}
//grp||proj Code||Proj Name||Location(P/J)||dbIndex
$hiramQ="SELECT pt.fldGroup,pt.fldOrder,pt.fldProject,dl.fldCode AS locCode,dr.fldEmployeeNum,dr.fldTrGroup,dr.fldProject AS projID FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN dispatch_locations AS dl ON dl.fldID=dr.fldLocation WHERE ((dr.fldGroup IN $mgaInd AND dr.fldTrGroup IS NOT NULL) OR dr.fldEmployeeNum IS NOT NULL $proj $grpMem) $dateCompare  GROUP BY dr.fldProject,locCode";
$hiramStmt=$connwebjmr->prepare($hiramQ);
$hiramStmt->execute();
if($hiramStmt->rowCount()>0){
    $hiramArr=$hiramStmt->fetchAll();
    foreach($hiramArr AS $hirams){
        $pGroup = $hirams['fldGroup'];
        if($pGroup==NULL){
            $pGroup = $hirams['fldTrGroup'];
        }
        $projID=$hirams['projID'];
        $pOrder = $hirams['fldOrder'];
        $pName = $hirams['fldProject'];
        $locCode = ($hirams['locCode']==0) ? 'P':'J';
        if(!in_array("$pGroup||$pOrder||$pName||$locCode||$projID-$locCode",$hiram)){
            array_push($hiram,"$pGroup||$pOrder||$pName||$locCode||$projID-$locCode");
        }
    }
}


#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($hiram);
// echo $hiramQ;
?>