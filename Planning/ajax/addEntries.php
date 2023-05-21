<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$addType=0;
if(isset($_REQUEST['addType'])){
    $addType=$_REQUEST['addType'];
}
$empNum='';
if(isset($_REQUEST['empNum'])){
    $empNum=$_REQUEST['empNum'];
}
$getGroup='';
if(isset($_REQUEST['getGroup'])){
    $getGroup=$_REQUEST['getGroup'];
}
$drDate='';
if(isset($_REQUEST['getDate'])){
    $drDate=$_REQUEST['getDate'];
}
$getLocation='';
if(isset($_REQUEST['getLocation'])){
    $getLocation=$_REQUEST['getLocation'];
}
$getProject='';
if(isset($_REQUEST['getProject'])){
    $getProject=$_REQUEST['getProject'];
}
$getItem='';
if(isset($_REQUEST['getItem'])){
    $getItem=$_REQUEST['getItem'];
}
$getDescription=NULL;
if(!empty($_REQUEST['getDescription'])){
    $getDescription=$_REQUEST['getDescription'];
}
$getTwoThree=NULL;
if(isset($_REQUEST['getTwoThree']) && !empty($_REQUEST['getTwoThree'])){
    $getTwoThree=$_REQUEST['getTwoThree'];
}
$getRev='0';
if(isset($_REQUEST['getRev'])){
    if($_REQUEST['getRev']){
        $getRev="1";
    }
}
$getType='';
if(isset($_REQUEST['getType'])){
    $getType=$_REQUEST['getType'];
}
$getChecking=NULL;
if(isset($_REQUEST['getChecking']) && !empty($_REQUEST['getChecking'])){
    $getChecking=$_REQUEST['getChecking'];
}
$getDuration='';
if(isset($_REQUEST['getDuration'])){
    $getDuration=$_REQUEST['getDuration'];
}
$getMHType='';
if(isset($_REQUEST['getMHType'])){
    $getMHType=$_REQUEST['getMHType'];
}
$getRemarks=NULL;
if(!empty($_REQUEST['getRemarks'])){
    $getRemarks=$_REQUEST['getRemarks'];
}
$getTrGrp=NULL;
if(!empty($_REQUEST['getTrGrp'])){
    $getTrGrp=$_REQUEST['getTrGrp'];
}
$logs=date("YmdHis")."_".$empNum;
#endregion
#region Entries Query
switch($addType){
    case "0":
        $insertDRQ="INSERT INTO dailyreport(fldEmployeeNum,fldGroup,fldDate,fldLocation,fldProject,fldItem,fldJobRequestDescription,fld2D3D,fldRevision,fldTOW,fldChecker,fldDuration,fldMHType,fldRemarks,fldChangeLog,fldTrGroup) 
VALUES(:empNum,:getGroup,:drDate,:getLocation,:getProject,:getItem,:getDescription,:getTwoThree,:getRev,:getType,:getChecking,:getDuration,:getMHType,:getRemarks,:logs,:getTrGrp)";
        break;
    default:
        $insertDRQ="UPDATE dailyreport SET fldEmployeeNum=:empNum,fldGroup=:getGroup,fldDate=:drDate,fldLocation=:getLocation,fldProject=:getProject,fldItem=:getItem,fldJobRequestDescription=:getDescription,fld2D3D=:getTwoThree,fldRevision=:getRev,fldTOW=:getType,fldChecker=:getChecking,fldDuration=:getDuration,fldMHType=:getMHType,fldRemarks=:getRemarks,fldChangeLog=:logs,fldTrGroup=:getTrGrp WHERE fldID=$addType";
        break;
}
// $insertDRQ="INSERT INTO dailyreport(fldEmployeeNum,fldGroup,fldDate,fldLocation,fldProject,fldItem,fldJobRequestDescription,fld2D3D,fldRevision,fldTOW,fldChecker,fldDuration,fldMHType,fldRemarks,fldChangeLog) 
// VALUES(:empNum,:getGroup,:drDate,:getLocation,:getProject,:getItem,:getDescription,:getTwoThree,:getRev,:getType,:getChecking,:getDuration,:getMHType,:getRemarks,:logs)";
$insertDRStmt=$connwebjmr->prepare($insertDRQ);
$resultInsertDR=$insertDRStmt->execute([":empNum"=>$empNum,":getGroup"=>$getGroup,":drDate"=>$drDate,":getLocation"=>$getLocation,":getProject"=>$getProject,":getItem"=>$getItem,":getDescription"=>$getDescription,":getTwoThree"=>$getTwoThree,":getRev"=>$getRev,":getType"=>$getType,":getChecking"=>$getChecking,":getDuration"=>$getDuration,":getMHType"=>$getMHType,":getRemarks"=>$getRemarks,":logs"=>$logs,":getTrGrp"=>$getTrGrp]);
#endregion
echo $addType;
?>