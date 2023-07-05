<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
date_default_timezone_set('Asia/Manila');
#region Initialize Variables
$trID='';
$dbCol="projectstable";
if(isset($_REQUEST['trID'])){
    $trID=$_REQUEST['trID'];
}
$empID=NULL;
if(!empty($_POST['empID'])){
    $empID=$_POST['empID'];
}
$timeDelete=date("Y-m-d H:i:s");
$deleteLog=$empID."_".$timeDelete;
$groupQ="SELECT fldGroup FROM projectstable WHERE fldID='$trID'";
$groupStmt=$connwebjmr->query($groupQ);
$empGroup=$groupStmt->fetchColumn();
$statement=" AND fldGroup='$empGroup'";
#endregion
#region Delete Query

//DELETE DRAWREF
$deleteJobQ="UPDATE drawingreference SET fldDelete=:deleteLog,fldPriority=0 WHERE fldProject=:trID AND fldDelete=0";
$deleteJobStmt=$connwebjmr->prepare($deleteJobQ);
$deleteJobStmt->execute([":deleteLog"=>$deleteLog,":trID"=>$trID]);
//DELETE ITEMOFWORKS
$deleteItemQ="UPDATE itemofworkstable SET fldDelete=:deleteLog,fldPriority=0 WHERE fldProject=:trID AND fldDelete=0";
$deleteItemStmt=$connwebjmr->prepare($deleteItemQ);
$deleteItemStmt->execute([":deleteLog"=>$deleteLog,":trID"=>$trID]);
//DELETE PROJ
$deleteQ="UPDATE projectstable SET fldDelete=:deleteLog,fldPriority=0 WHERE fldID=:trID";
$deleteStmt=$connwebjmr->prepare($deleteQ);
$deleteStmt->execute([":deleteLog"=>$deleteLog,":trID"=>$trID]);

require_once 'updateprio.php';


#endregion
?>