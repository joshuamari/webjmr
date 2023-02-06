<?php 
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$projID='';
if(isset($_REQUEST['projID'])){
    $projID=$_REQUEST['projID'];
}
$itemID='';
if(isset($_REQUEST['itemID'])){
    $itemID=$_REQUEST['itemID'];
}
$trID='';
if(isset($_REQUEST['trID'])){
    $trID=$_REQUEST['trID'];
}
$prioVal='';
if(isset($_REQUEST['prioVal'])){
    $prioVal=$_REQUEST['prioVal'];
}
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
$type='';
if(isset($_REQUEST['type'])){
    $type=$_REQUEST['type'];
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

$prioq="SELECT MAX(fldPriority) FROM `$dbCol` WHERE fldActive='1' $statement";
$priostmt=$connwebjmr->query($prioq);
$maxPrio=$priostmt->fetchColumn();
$currentq="SELECT fldPriority FROM `$dbCol` WHERE fldID='$trID'";
$currentstmt=$connwebjmr->query($currentq);
$oldprio=$currentstmt->fetchColumn();
$newprio='';
#endregion


switch($prioVal){
    case 'oneUp':
        $newprio=$oldprio-1;
        $editoldq="UPDATE `$dbCol` SET fldPriority='$oldprio' WHERE fldPriority='$newprio' $statement";
        $editoldstmt=$connwebjmr->query($editoldq);
        break;
    case 'oneDown':
        $newprio=$oldprio+1;
        $editoldq="UPDATE `$dbCol` SET fldPriority='$oldprio' WHERE fldPriority='$newprio' $statement";
        $editoldstmt=$connwebjmr->query($editoldq);
        break;
    case 'maxUp':
        $newprio='-1';
        // require_once 'updateprio.php';
            break;
    default:
        $newprio=$maxPrio+1;
        // require_once 'updateprio.php';
}

$editnewq="UPDATE `$dbCol` SET fldPriority='$newprio' WHERE fldID='$trID'";
$editnewstmt=$connwebjmr->query($editnewq);
if($prioVal=="maxUp" || $prioVal=="maxDown"){
    require_once 'updateprio.php';
}
// echo $newprio;
?>

