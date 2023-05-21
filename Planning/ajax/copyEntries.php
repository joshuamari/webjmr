<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$empNum='';
if(isset($_REQUEST['empNum'])){
    $empNum=$_REQUEST['empNum'];
}
$drDate='';
if(isset($_REQUEST['getDate'])){
    $drDate=$_REQUEST['getDate'];
}
$copyDate='';
if(isset($_REQUEST['copyDate'])){
    $copyDate=$_REQUEST['copyDate'];
}
$logs=date("YmdHis")."_".$empNum;
$getGroup='';
$getLocation='';
$getProject='';
$getItem='';
$getDescription='';
$getTwoThree=NULL;
$getRev='0';
$getType='';
$getChecking=NULL;
$getDuration='';
$getMHType='';
$getRemarks='';
$getTrGrp=NULL;
#endregion
#region Copy Entries Query
$copyDRQ="INSERT INTO dailyreport(fldEmployeeNum,fldGroup,fldDate,fldLocation,fldProject,fldItem,fldJobRequestDescription,fld2D3D,fldRevision,fldTOW,fldChecker,fldDuration,fldMHType,fldRemarks,fldChangeLog,fldTrGroup) 
VALUES(:empNum,:getGroup,:drDate,:getLocation,:getProject,:getItem,:getDescription,:getTwoThree,:getRev,:getType,:getChecking,:getDuration,:getMHType,:getRemarks,:logs,:getTrGrp)";
$copyDRStmt=$connwebjmr->prepare($copyDRQ);
$drQ ="SELECT dr.*,pt.fldDelete AS projDel FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID WHERE dr.fldEmployeeNum=:empNum AND dr.fldDate=:copyDate";
$drStmt=$connwebjmr->prepare($drQ);
$drStmt->execute([":empNum"=>$empNum,":copyDate"=>$copyDate]);
$drArr = $drStmt -> fetchAll();
foreach($drArr AS $drEntries){
    $getGroup=$drEntries['fldGroup'];
    $getLocation=$drEntries['fldLocation'];
    $getProject=$drEntries['fldProject'];
    $getItem=$drEntries['fldItem'];
    $getDescription=$drEntries['fldJobRequestDescription'];
    $getTwoThree=$drEntries['fld2D3D'];
    $getRev=$drEntries['fldRevision'];
    $getType=$drEntries['fldTOW'];
    $getChecking=$drEntries['fldChecker'];
    $getDuration=$drEntries['fldDuration'];
    $getMHType=$drEntries['fldMHType'];
    $getRemarks=$drEntries['fldRemarks'];
    $getTrGrp=$drEntries['fldTrGroup'];
    $projDel=$drEntries['projDel'];
    if($projDel==0){
        $copyDRStmt->execute([":empNum"=>$empNum,":getGroup"=>$getGroup,":drDate"=>$drDate,":getLocation"=>$getLocation,":getProject"=>$getProject,":getItem"=>$getItem,":getDescription"=>$getDescription,":getTwoThree"=>$getTwoThree,":getRev"=>$getRev,":getType"=>$getType,":getChecking"=>$getChecking,":getDuration"=>$getDuration,":getMHType"=>$getMHType,":getRemarks"=>$getRemarks,":logs"=>$logs,":getTrGrp"=>$getTrGrp]);
    }
}

#endregion
echo "sabre";
?>