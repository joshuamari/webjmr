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
if($selProj!=$trainProjID){
    $statement=" AND fldItem='$selItem' AND fldGroup='$empGroup'";
}
$jobsArray=array();
#endregion
#region Projects Query
$jobsQ="SELECT * FROM drawingreference WHERE fldProject='$selProj' $statement AND fldDelete=0 ORDER BY fldActive DESC,fldPriority";
$jobsStmt=$connwebjmr->query($jobsQ);
$jobArr=$jobsStmt->fetchAll();
if(count($jobArr)>0){
    foreach($jobArr AS $job){
        $output = array();
        $jobName = $job['fldJob'];
        $jobID = $job['fldID'];
        $jobSheets = $job['fldNoSheets'];
        $paperSize = $job['fldPaperSize'];
        $drawingName = $job['fldDrawingName'];
        $khiDate = $job['fldKHIDate'];
        $khiC = $job['fldKHIC'];
        $khiDeadline = $job['fldKHIDeadline'];
        $kdtDeadline = $job['fldKDTDeadline'];
        $expectedMH = $job['fldExpectedMH'];
        $jobActive = $job['fldActive'];
        $output += ["jobName" => $jobName];
        $output += ["jobID" => $jobID];
        $output += ["jobSheets" => $jobSheets];
        $output += ["paperSize" => $paperSize];
        $output += ["drawingName" => $drawingName];
        $output += ["khiDate" => $khiDate];
        $output += ["khiC" => $khiC];
        $output += ["khiDeadline" => $khiDeadline];
        $output += ["kdtDeadline" => $kdtDeadline];
        $output += ["expectedMH" => $expectedMH];
        $output += ["jobActive" => $jobActive];
        array_push($jobsArray, $output);
        // array_push($jobs,$job['fldJob']."||".$job['fldID']."||".$job['fldNoSheets']."||".$job['fldPaperSize']."||".$job['fldDrawingName']."||".$job['fldKHIDate']."||".$job['fldKHIC']."||".$job['fldKHIDeadline']."||".$job['fldKDTDeadline']."||".$job['fldExpectedMH']."||".$job['fldActive']."||".$job['fldPriority']);
    }
}
#endregion
echo json_encode($jobsArray);
?>