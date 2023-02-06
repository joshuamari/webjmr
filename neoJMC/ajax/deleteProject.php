<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$trID='';
$dbCol="projectstable";
if(isset($_REQUEST['trID'])){
    $trID=$_REQUEST['trID'];
}

$groupQ="SELECT fldGroup FROM projectstable WHERE fldID='$trID'";
$groupStmt=$connwebjmr->query($groupQ);
$empGroup=$groupStmt->fetchColumn();
$statement=" AND fldGroup='$empGroup'";
#endregion
#region Delete Query

//DELETE DRAWREF
$deleteJobQ="UPDATE drawingreference SET fldDelete=1,fldPriority=0 WHERE fldProject='$trID'";
$deleteJobStmt=$connwebjmr->query($deleteJobQ);
//DELETE ITEMOFWORKS
$deleteItemQ="UPDATE itemofworkstable SET fldDelete=1,fldPriority=0 WHERE fldProject='$trID'";
$deleteItemStmt=$connwebjmr->query($deleteItemQ);
//DELETE PROJ
$deleteQ="UPDATE projectstable SET fldDelete=1,fldPriority=0 WHERE fldID=:trID";
$deleteStmt=$connwebjmr->prepare($deleteQ);
$deleteStmt->execute([":trID"=>$trID]);

require_once 'updateprio.php';


#endregion
?>