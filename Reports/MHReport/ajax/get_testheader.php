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
$testHeader=array();

#endregion

#region main
//Grp||Proj Code||Proj Name||Location(P/J)||dbIndex
$thQ="SELECT pt.fldProject AS projName,pt.fldOrder AS projOrder,pt.fldID AS projID,dr.fldLocation,dl.fldCode AS locCode,pt.fldGroup AS pGroup,pt.fldDelete AS projDel FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN dispatch_locations AS dl ON dr.fldLocation=dl.fldID WHERE (dr.fldProject IN (SELECT fldID FROM projectstable WHERE fldGroup='$rawGetGroup')) $dateCompare GROUP BY dr.fldProject,locCode ORDER BY CASE WHEN locCode=0 THEN 1 ELSE 2 END,pt.fldGroup,pt.fldOrder,pt.fldProject";
$thStmt=$connwebjmr->prepare($thQ);
$thStmt->execute();
    if($thStmt->rowCount()>0){
        $thArr=$thStmt->fetchAll();
        foreach($thArr AS $ths){
            $orderNum = stringify($ths['projOrder']);
            $projName = stringify($ths['projName']);
            $projID = $ths['projID'];
            $pGroup = $ths['pGroup'];
            $locCode = ($ths['locCode']==0) ? 'P':'J';
            $projDel = ($ths['projDel']!=0) ? '(Deleted)':'';
            if(!in_array("$pGroup||$orderNum||$projName||$locCode||$projID-$locCode",$testHeader)){
                array_push($testHeader,"$pGroup||$orderNum||$projDel$projName||$locCode||$projID-$locCode||$projDel");
            }
        }
    }
#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($testHeader);
// echo $thQ;
?>