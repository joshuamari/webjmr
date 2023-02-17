<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$defaultPID=['1','2','3'];
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
$selProj='';
if(isset($_REQUEST['selProj'])){
    $selProj=$_REQUEST['selProj'];
}
$selItem='';
if(isset($_REQUEST['selItem'])){
    $selItem=$_REQUEST['selItem'];
}
$statement=" AND fldItem IS NULL";
if(!in_array($selProj,$defaultPID)){
    $statement=" AND fldItem='$selItem'";
}
$jobs=array();
#endregion
#region Projects Query
$jobsQ="SELECT * FROM drawingreference WHERE fldGroup='$empGroup' AND fldProject='$selProj' $statement AND fldDelete=0 ORDER BY fldActive DESC,fldPriority";
$jobsStmt=$connwebjmr->query($jobsQ);
$jobArr=$jobsStmt->fetchAll();
if(count($jobArr)>0){
    foreach($jobArr AS $job){
        array_push($jobs,$job['fldJob']."||".$job['fldID']."||".$job['fldNoSheets']."||".$job['fldPaperSize']."||".$job['fldKHIDate']."||".$job['fldKHIC']."||".$job['fldKHIDeadline']."||".$job['fldKDTDeadline']."||".$job['fldExpectedMH']."||".$job['fldActive']."||".$job['fldPriority']);
    }
}
#endregion
echo json_encode($jobs);
?>