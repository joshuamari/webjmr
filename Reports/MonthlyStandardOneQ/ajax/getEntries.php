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
if(!empty($_POST['getGroup'])){
    $rawGetGroup=$_POST['getGroup'];
    if(in_array($rawGetGroup,$mgaU)){
        $getGroups=$mgaU;
    }
    else{
        array_push($getGroups,$rawGetGroup);
    }
}
// $getGroups=array("CEM");
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
$entries=array();

#endregion

#region main
foreach($getGroups AS $getGroup){
$proj='';
$projsQ="SELECT DISTINCT(dr.fldProject) FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID WHERE (dr.fldProject IN (SELECT fldID FROM projectstable WHERE fldGroup=:getGroup)) $dateCompare";
$projStmt=$connwebjmr->prepare($projsQ);
$projStmt->execute([":getGroup"=>$getGroup]);
if($projStmt->rowCount()>0){
    $proj.=" AND dr.fldProject IN (";
    $projsArr=$projStmt->fetchAll();
    foreach($projsArr AS $projs){
        $projID=$projs['fldProject'];
        $proj.="'$projID',";
    }
    $proj=rtrim($proj,",");
    $proj.=")";
}
//emp#||dbIndex||duration
$entQ="SELECT SUM(fldDuration) AS totalHrs,dr.fldEmployeeNum,pt.fldOrder,dr.fldLocation,dl.fldCode AS locCode,dr.fldProject FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN dispatch_locations AS dl ON dr.fldLocation=dl.fldID WHERE (dr.fldEmployeeNum IS NOT NULL $proj) $dateCompare GROUP BY dr.fldProject,dr.fldEmployeeNum";
$entStmt=$connwebjmr->prepare($entQ);
$entStmt->execute();
if($entStmt->rowCount()>0){
    $entArr=$entStmt->fetchAll();
    foreach($entArr AS $ent){
        $enum = $ent['fldEmployeeNum'];
        $thrs = ((float)$ent['totalHrs'])/60;
        $pOrder = $ent['fldOrder'];
        $projID = $ent['fldProject'];
        $locCode = ($ent['locCode']==0) ? 'P':'J';
        if(!in_array("$enum||$projID-$locCode||$thrs",$entries)){
            array_push($entries,"$enum||$projID-$locCode||$thrs");
        }
        // array_push($entries,"$enum||$projID-$locCode||$thrs");
    }
}
}
#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($entries);
// echo $entQ;
?>