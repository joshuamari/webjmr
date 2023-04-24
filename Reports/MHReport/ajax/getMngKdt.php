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
$mngakdt=array();
$proj=' AND dr.fldProject IN (';
foreach($defaultProjID AS $dpi){
    if($dpi!=$leaveID){
        $proj.="'$dpi',";
    }
}
$proj=rtrim($proj,",");
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
//emp#||dbIndex||duration(7,8,9,11,13,22,23,24)
$mngkdtQ="SELECT SUM(fldDuration) AS totalHrs,dr.fldEmployeeNum,pt.fldOrder,dl.fldCode AS locCode,dr.fldProject,dr.fldItem FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN dispatch_locations AS dl ON dr.fldLocation=dl.fldID WHERE ((fldTrGroup=:getGroup) OR dr.fldEmployeeNum IS NOT NULL $proj $grpMem AND fldTrGroup IS NULL) $dateCompare GROUP BY locCode,CASE WHEN dr.fldGroup NOT IN('SYS','ANA','IT','ETCL','MPM') THEN dr.fldProject END,dr.fldEmployeeNum";
$mngkdtStmt=$connwebjmr->prepare($mngkdtQ);
$mngkdtStmt->execute([":getGroup"=>$getGroup]);
if($mngkdtStmt->rowCount()>0){
    $mngkdtArr=$mngkdtStmt->fetchAll();
    foreach($mngkdtArr AS $mngkdt){
        $pID = $mngkdt['fldProject'];
        $itemID = $mngkdt['fldItem'];
        $enum = $mngkdt['fldEmployeeNum'];
        $locCode = ($mngkdt['locCode']==0) ? '1':'2';
        $thrs = ((float)$mngkdt['totalHrs'])/60;
        $kdtCode='';
        if($pID==$mngProjID){
            if(in_array($getGroup,$noCounterpartBU)){
                $kdtCode='K';
            }
            else{
                $kdtCode='M';
            }
        }
        else{
            if(in_array($itemID,$kdtWholeItems)){
                $kdtCode='K';
            }
            if(in_array($itemID,$khiWholeItems)){
                $kdtCode='B';
            }
            if(in_array($itemID,$halfItems)){
                $kdtCode='K';
                if(!in_array($getGroup,$noCounterpartBU)){
                    $thrs=$thrs/2;
                    array_push($mngakdt,"$enum||$kdtCode$locCode||$thrs");
                    $kdtCode='B';
                }
            }
        }
        array_push($mngakdt,"$enum||$kdtCode$locCode||$thrs");
    }
}

#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($mngakdt);
// echo $mngkdtQ;
?>