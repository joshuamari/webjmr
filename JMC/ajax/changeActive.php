<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$type='';
if(isset($_REQUEST['type'])){
    $type=$_REQUEST['type'];
}
$projID='';
if(isset($_REQUEST['projID'])){
    $projID=$_REQUEST['projID'];
}
$itemID='';
if(isset($_REQUEST['itemID'])){
    $itemID=$_REQUEST['itemID'];
}
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
$dbCol="";
$statement="";
switch($type){
    case "p":
        $dbCol="projectstable";
        $statement=" AND fldGroup='$empGroup'";
        break;
    case "i":
        $dbCol="itemofworkstable";
        $statement=" AND fldGroup='$empGroup' AND fldProject='$projID'";
        break;
    case "j":
        $dbCol="drawingreference";
        $statement=" AND fldGroup='$empGroup' AND fldProject='$projID' AND (fldItem='$itemID' OR fldItem IS NULL)";
        break;
}
$trID='';
if(isset($_REQUEST['trID'])){
    $trID=$_REQUEST['trID'];
}
$isCheck='';
if(isset($_REQUEST['isCheck'])){
    $isCheck=$_REQUEST['isCheck'];
}

$isActive='0';
$newPrio='0';
$prioq="SELECT MAX(fldPriority) FROM `$dbCol` WHERE fldActive='1' $statement";
$priostmt=$connwebjmr->query($prioq);
$maxPrio=$priostmt->fetchColumn();
if($isCheck=='true'){
    $newPrio=$maxPrio+1;
    $isActive='1';
}
#endregion
#region Update Query
$updateQ="UPDATE `$dbCol` SET fldPriority=:newPrio,fldActive=:isActive WHERE fldID=:trID";
$updateStmt=$connwebjmr->prepare($updateQ);
$updateStmt->execute([":newPrio"=>$newPrio,":isActive"=>$isActive,":trID"=>$trID]);
#endregion
require_once 'updateprio.php';
?>