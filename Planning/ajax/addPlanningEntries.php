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
$getEmp='';
if(isset($_REQUEST['getEmp'])){
    $getEmp=$_REQUEST['getEmp'];
}
$getsDate='';
if(isset($_REQUEST['getsDate'])){
    $getsDate=$_REQUEST['getsDate'];
}
$geteDate='';
if(isset($_REQUEST['geteDate'])){
    $geteDate=$_REQUEST['geteDate'];
}
$getMH='';
if(isset($_REQUEST['getMH'])){
    $getMH=$_REQUEST['getMH'];
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