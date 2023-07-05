<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$dateModified=date("Y-m-d H:i:s");
$planID=NULL;
if(!empty($_POST['planID'])){
    $planID=$_POST['planID'];
}
$getEmp=NULL;
if(!empty($_POST['getEmp'])){
    $getEmp=$_POST['getEmp'];
}
$getDescription=NULL;
if(!empty($_POST['getDescription'])){
    $getDescription=$_POST['getDescription'];
}
$getsDate=NULL;
if(!empty($_POST['getsDate'])){
    $getsDate=$_POST['getsDate'];
}
$geteDate=NULL;
if(!empty($_POST['geteDate'])){
    $geteDate=$_POST['geteDate'];
}
$getMH=NULL;
if(!empty($_POST['getMH'])){
    $getMH=$_POST['getMH'];
}
#endregion

#region Entries Query
$updateQ="UPDATE planning SET fldEmployeeNum=:getEmp, fldJob=:getDescription, fldStartDate=:getsDate, fldEndDate=:geteDate, fldHours=:getMH, fldDateModified=:dateModified WHERE fldID=:planID";
$updateStmt=$connwebjmr->prepare($updateQ);
$updateStmt->execute([":getEmp"=>$getEmp,":getDescription"=>$getDescription,":getsDate"=>$getsDate,":geteDate"=>$geteDate,":getMH"=>$getMH,":planID"=>$planID,":dateModified"=>$dateModified]);
#endregion

?>