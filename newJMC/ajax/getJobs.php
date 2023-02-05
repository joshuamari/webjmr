<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
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
if($selProj!=1){
    $statement=" AND fldItem='$selItem'";
}
$jobs=array();
$prioq="SELECT MAX(fldPriority) FROM drawingreference WHERE fldActive='1' AND fldGroup='$empGroup' AND fldProject='$selProj' AND (fldItem='$selItem' OR fldItem IS NULL)";
$priostmt=$connwebjmr->query($prioq);
$maxPrio=$priostmt->fetchColumn();
#endregion
#region Projects Query
$jobsQ="SELECT * FROM drawingreference WHERE fldGroup='$empGroup'$statement AND fldDelete=0 ORDER BY fldActive DESC,fldPriority";
$jobsStmt=$connwebjmr->query($jobsQ);
$jobArr=$jobsStmt->fetchAll();
if(count($jobArr)>0){
    foreach($jobArr AS $job){
        array_push($jobs,$job['fldJob']."||j_".$job['fldID']."||".$job['fldNoSheets']."||".$job['fldPaperSize']."||".$job['fldKHIDate']."||".$job['fldKHIC']."||".$job['fldKHIDeadline']."||".$job['fldKDTDeadline']."||".$job['fldExpectedMH']."||".$job['fldActive']."||".$job['fldPriority']."||".$maxPrio);
    }
}
#endregion
echo json_encode($jobs);
?>