<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$id='';
if(isset($_REQUEST['id'])){
    $id=$_REQUEST['id'];
}
$projName='';
if(isset($_REQUEST['editPName'])){
    $projName=$_REQUEST['editPName'];
}
$orderNum=NULL;
if(!empty($_REQUEST['editPOrder'])){
    $orderNum=$_REQUEST['editPOrder'];
}
$buic=NULL;
if(!empty($_REQUEST['editPBUIC'])){
    $buic=$_REQUEST['editPBUIC'];
}
#endregion
#region Update Query
$updateQ="UPDATE projectstable SET fldProject=:projName,fldOrder=:orderNum,fldBUIC=:buic WHERE fldID=:id";
$updateStmt=$connwebjmr->prepare($updateQ);
$updateStmt->execute([":projName"=>$projName,":orderNum"=>$orderNum,":buic"=>$buic,":id"=>$id]);
#endregion
?>