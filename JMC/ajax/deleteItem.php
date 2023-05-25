<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
date_default_timezone_set('Asia/Manila');
#region Initialize Variables
$trID='';
$dbCol="itemofworkstable";
if(isset($_REQUEST['trID'])){
    $trID=$_REQUEST['trID'];
}
$empID=NULL;
if(!empty($_POST['empID'])){
    $empID=$_POST['empID'];
}
$timeDelete=date("Y-m-d H:i:s");
$deleteLog=$empID."_".$timeDelete;
$projIDQ="SELECT fldProject FROM itemofworkstable WHERE fldID='$trID'";
$projIDStmt=$connwebjmr->query($projIDQ);
$projID=$projIDStmt->fetchColumn();
$statement=" AND fldProject='$projID'";
#endregion
#region Delete Query
//DELETE DRAWREF
$deleteJobQ="UPDATE drawingreference SET fldDelete=:deleteLog,fldPriority=0 WHERE fldItem=:trID AND fldDelete=0";
$deleteJobStmt=$connwebjmr->prepare($deleteJobQ);
$deleteJobStmt->execute([":deleteLog"=>$deleteLog,":trID"=>$trID]);
//DELETE ITEM
$deleteQ="UPDATE itemofworkstable SET fldDelete=:deleteLog,fldPriority=0 WHERE fldID=:trID";
$deleteStmt=$connwebjmr->prepare($deleteQ);
$deleteStmt->execute([":deleteLog"=>$deleteLog,":trID"=>$trID]);
#endregion

require_once 'updateprio.php';
?>