<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$trID='';
$dbCol="itemofworkstable";
if(isset($_REQUEST['trID'])){
    $trID=$_REQUEST['trID'];
}
$projIDQ="SELECT fldProject FROM itemofworkstable WHERE fldID='$trID'";
$projIDStmt=$connwebjmr->query($projIDQ);
$projID=$projIDStmt->fetchColumn();
$statement=" AND fldProject='$projID'";
#endregion
#region Delete Query
//DELETE DRAWREF
$deleteJobQ="UPDATE drawingreference SET fldDelete=1,fldPriority=0 WHERE fldProject='$trID'";
$deleteJobStmt=$connwebjmr->query($deleteJobQ);
//DELETE ITEM
$deleteQ="UPDATE itemofworkstable SET fldDelete=1,fldPriority=0 WHERE fldID=:trID";
$deleteStmt=$connwebjmr->prepare($deleteQ);
$deleteStmt->execute([":trID"=>$trID]);
#endregion

require_once 'updateprio.php';
?>