<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
$jobs=array();
#endregion
#region Projects Query
$jobsQ="SELECT * FROM drawingreference WHERE fldProject=1 AND fldGroup='$empGroup'";
$jobsStmt=$connwebjmr->query($jobsQ);
$jobArr=$jobsStmt->fetchAll();
if(count($jobArr)>0){
    foreach($jobArr AS $job){
        array_push($jobs,$job['fldJob']."||j_".$job['fldID']."||".$job['fldNoSheets']."||".$job['fldPaperSize']."||".$job['fldDrawingName']."||".$job['fldKHIDate']."||".$job['fldKHIC']."||".$job['fldKHIDeadline']."||".$job['fldKDTDeadline']."||".$job['fldExpectedMH']."||".$job['fldActive']."||".$job['fldPriority']);
    }
}
#endregion
echo json_encode($jobs);
?>