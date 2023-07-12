<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$datePlanned=date("Y-m-d H:i:s");
$empNum=NULL;
if(!empty($_POST['empNum'])){
    $empNum=$_POST['empNum'];
}
$getEmp=array();
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
$insertQ="INSERT INTO planning(fldPlanner, fldDatePlanned, fldEmployeeNum, fldJob, fldStartDate, fldEndDate, fldHours, fldDateModified) 
VALUES(:empNum,:datePlanned,:getEmp,:getDescription,:getsDate,:geteDate,:getMH,:datePlanned)";
$insertStmt=$connwebjmr->prepare($insertQ);
foreach($getEmp AS $emps){
    $insertStmt->execute([":empNum"=>$empNum,":datePlanned"=>$datePlanned,":getEmp"=>$emps,":getDescription"=>$getDescription,":getsDate"=>$getsDate,":geteDate"=>$geteDate,":getMH"=>$getMH]);
    echo $emps."<br>";
}

#endregion
?>