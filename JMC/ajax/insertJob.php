<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$projID='';
if(isset($_REQUEST['projID'])){
    $projID=$_REQUEST['projID'];
}
$itemID=NULL;
$grp=NULL;
if($projID!=1 && $projID !=5){
    if(isset($_REQUEST['itemID'])){
        $itemID=$_REQUEST['itemID'];
    }
}
if($projID!=5){
    if(isset($_REQUEST['grp'])){
        $grp=$_REQUEST['grp'];
    }
}
$jobName='';
if(isset($_REQUEST['jobName'])){
    $jobName=$_REQUEST['jobName'];
}
$prioq="SELECT MAX(fldPriority) FROM drawingreference WHERE fldActive='1' AND fldGroup='$grp' AND fldProject='$projID' AND (fldItem='$itemID' OR fldItem IS NULL)";
$priostmt=$connwebjmr->query($prioq);
$maxPrio=$priostmt->fetchColumn();
$maxPrio++;
#endregion

#region Insert Query
$projQ="INSERT INTO drawingreference(fldProject,fldItem,fldJob,fldGroup,fldPriority) VALUES (:projID,:itemID,:jobName,:grp,:maxPrio)";
$projStmt=$connwebjmr->prepare($projQ);
$projStmt->execute([":projID"=>$projID,":itemID"=>$itemID,":jobName"=>$jobName,":grp"=>$grp,":maxPrio"=>$maxPrio]);
#endregion
?>