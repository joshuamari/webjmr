<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$projName='';
if(isset($_REQUEST['projName'])){
    $projName=$_REQUEST['projName'];
}
$grp='';
if(isset($_REQUEST['grp'])){
    $grp=$_REQUEST['grp'];
}
$orderNum=NULL;
if(!empty($_REQUEST['orderNum'])){
    $orderNum=$_REQUEST['orderNum'];
}
$buic=NULL;
if(!empty($_REQUEST['buic'])){
    $buic=$_REQUEST['buic'];
}
$prioq="SELECT MAX(fldPriority) FROM projectstable WHERE fldActive='1' AND fldGroup='$grp'";
$priostmt=$connwebjmr->query($prioq);
$maxPrio=$priostmt->fetchColumn();
$maxPrio++;
$dupq="SELECT COUNT(*) FROM projectstable WHERE fldDelete='0' AND (fldGroup='$grp' OR fldGroup IS NULL) AND fldProject='$projName'";
$dupstmt=$connwebjmr->query($dupq);
$dup=$dupstmt->fetchColumn();
#endregion

#region Insert Query
if($dup>0){
    echo "Duplicate Title";
}
else{
    $projQ="INSERT INTO projectstable(fldProject,fldGroup,fldOrder,fldBUIC,fldPriority) VALUES (:projName,:grp,:orderNum,:buic,:maxPrio)";
    $projStmt=$connwebjmr->prepare($projQ);
    $projStmt->execute([":projName"=>$projName,":grp"=>$grp,":orderNum"=>$orderNum,":buic"=>$buic,":maxPrio"=>$maxPrio]);
}

#endregion
?>