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
$entries=array();
$proj='';
$projsQ="SELECT DISTINCT(dr.fldProject) FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID WHERE (dr.fldProject IN (SELECT fldID FROM projectstable WHERE fldGroup=:getGroup)) $dateCompare GROUP BY dr.fldProject,dr.fldLocation";
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
#endregion

#region main
//emp#||dbIndex||duration
$entQ="SELECT SUM(fldDuration) AS totalHrs,dr.fldEmployeeNum,pt.fldOrder,dr.fldLocation,dl.fldCode AS locCode FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN dispatch_locations AS dl ON dr.fldLocation=dl.fldID WHERE (dr.fldEmployeeNum IS NOT NULL $proj) $dateCompare GROUP BY dr.fldProject,dr.fldEmployeeNum";
$entStmt=$connwebjmr->prepare($entQ);
$entStmt->execute();
if($entStmt->rowCount()>0){
    $entArr=$entStmt->fetchAll();
    foreach($entArr AS $ent){
        $enum = $ent['fldEmployeeNum'];
        $thrs = ((float)$ent['totalHrs'])/60;
        $pOrder = $ent['fldOrder'];
        $locCode = ($ent['locCode']==0) ? 'P':'J';
        array_push($entries,"$enum||$pOrder-$locCode||$thrs");
    }
}

#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($entries);
// echo $projsQ;
?>