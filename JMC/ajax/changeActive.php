<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$type='';
if(isset($_REQUEST['trType'])){
    $type=$_REQUEST['trType'];
}
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
$trID='';
if(isset($_REQUEST['trID'])){
    $trID=$_REQUEST['trID'];
}
$isCheck='';
if(isset($_REQUEST['isCheck'])){
    $isCheck=$_REQUEST['isCheck'];
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
        $projQ="SELECT fldProject FROM itemofworkstable WHERE fldID='$trID'";
        $projStmt=$connwebjmr->query($projQ);
        $projID=$projStmt->fetchColumn();
        $statement=" AND fldGroup='$empGroup' AND fldProject='$projID'";
        break;
    case "j":
        $dbCol="drawingreference";
        $piQ="SELECT fldProject,fldItem FROM drawingreference WHERE fldID='$trID'";
        $piStmt=$connwebjmr->query($piQ);
        if($piStmt->rowCount()>0){
            $piArr=$piStmt->fetchAll();
            foreach($piArr AS $pis){
                $projID=$pis['fldProject'];
                $itemID=$pis['fldItem'];
            }
        }
        $statement=" AND fldGroup='$empGroup' AND fldProject='$projID' AND (fldItem='$itemID' OR fldItem IS NULL)";
        break;
}

$isActive='0';
$newPrio='0';
$prioq="SELECT MAX(fldPriority) FROM `$dbCol` WHERE fldActive='1' $statement";
$priostmt=$connwebjmr->query($prioq);
$maxPrio=$priostmt->fetchColumn();
if($isCheck=='1'){
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