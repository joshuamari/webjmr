<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$output="<option value='' selected hidden>Select Job Request Description</option>";
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
$projID='';
if(isset($_REQUEST['projID'])){
    $projID=$_REQUEST['projID'];
}
$itemID='';
if(isset($_REQUEST['itemID'])){
    $itemID=$_REQUEST['itemID'];
}
$statement=" AND fldItem=$itemID";
if($projID==1 || $projID==5 || $projID==4){
    $statement=" AND fldItem IS NULL";
}
$empNum='';
if(isset($_REQUEST['empNum'])){
    $empNum=$_REQUEST['empNum'];
}
$sharedProjects="OR fldProject IN (";
$spQ="SELECT * FROM project_share WHERE fldEmployeeNum='$empNum'";
$spStmt=$connwebjmr->query($spQ);
if($spStmt->rowCount()>0){
    $spArr=$spStmt->fetchAll();
    foreach($spArr AS $sps){
        $sp=$sps['fldProject'];
        $sharedProjects.="'$sp',";
    }
    $sharedProjects=rtrim($sharedProjects,',');
    $sharedProjects.=")";
}
else{
    $sharedProjects="";
}
#endregion
#region MyGroup Query
if($itemID!=''){
    $jobQ="SELECT * FROM drawingreference WHERE fldProject=:projID $statement AND fldActive=1 AND (fldGroup=:empGroup OR fldGroup IS NULL $sharedProjects) AND fldDelete=0 ORDER BY fldPriority";
    $jobStmt=$connwebjmr->prepare($jobQ);
    $jobStmt->execute([":projID"=>$projID,":empGroup"=>$empGroup]);
    $jobArr=$jobStmt->fetchAll();
    foreach($jobArr AS $job){
        $jobName=$job['fldJob'];
        $jobID=$job['fldID'];
        $output.="<option job-id='$jobID'>$jobName</option>";
    }
}
#endregion
echo $output;
?>