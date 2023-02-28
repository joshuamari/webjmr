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
if($projID!=2){
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
$jobSheet='';
if(isset($_REQUEST['jobSheet'])){
    $jobSheet=$_REQUEST['jobSheet'];
}
$jobPaper=NULL;
if(isset($_REQUEST['jobPaper'])){
    $jobPaper=$_REQUEST['jobPaper'];
}
$jobKHIReq=NULL;
if(isset($_REQUEST['jobKHIReq'])){
    $jobKHIReq=$_REQUEST['jobKHIReq'];
}
$jobKHICharge=NULL;
if(isset($_REQUEST['jobKHICharge'])){
    $jobKHICharge=$_REQUEST['jobKHICharge'];
}
$jobKHIDead=NULL;
if(isset($_REQUEST['jobKHIDead'])){
    $jobKHIDead=$_REQUEST['jobKHIDead'];
}
$jobKDTDead=NULL;
if(isset($_REQUEST['jobKDTDead'])){
    $jobKDTDead=$_REQUEST['jobKDTDead'];
}
$jobMH=NULL;
if(isset($_REQUEST['jobMH'])){
    $jobMH=$_REQUEST['jobMH'];
}
$prioq="SELECT MAX(fldPriority) FROM drawingreference WHERE fldActive='1' AND fldGroup='$grp' AND fldProject='$projID' AND (fldItem='$itemID' OR fldItem IS NULL)";
$priostmt=$connwebjmr->query($prioq);
$maxPrio=$priostmt->fetchColumn();
$maxPrio++;
$dupq="SELECT COUNT(*) FROM drawingreference WHERE fldDelete='0' AND fldGroup='$grp' AND fldProject='$projID' AND (fldItem='$itemID' OR fldItem IS NULL) AND fldJob='$jobName'";
$dupstmt=$connwebjmr->query($dupq);
$dup=$dupstmt->fetchColumn();
#endregion

#region Insert Query
if($dup>0){
    echo "Duplicate Title";
}
else{
    $projQ="INSERT INTO drawingreference(fldProject,fldItem,fldJob,fldGroup,fldPriority,fldNoSheets,fldPaperSize,fldKHIDate,fldKHIC,fldKHIDeadline,fldKDTDeadline,fldExpectedMH) VALUES (:projID,:itemID,:jobName,:grp,:maxPrio,:jobSheet,:jobPaper,:jobKHIReq,:jobKHICharge,:jobKHIDead,:jobKDTDead,:jobMH)";
    $projStmt=$connwebjmr->prepare($projQ);
    $projStmt->execute([":projID"=>$projID,":itemID"=>$itemID,":jobName"=>$jobName,":grp"=>$grp,":maxPrio"=>$maxPrio,":jobSheet"=>$jobSheet,":jobPaper"=>$jobPaper,":jobKHIReq"=>$jobKHIReq,":jobKHICharge"=>$jobKHICharge,":jobKHIDead"=>$jobKHIDead,":jobKDTDead"=>$jobKDTDead,":jobMH"=>$jobMH]);
}
#endregion
?>