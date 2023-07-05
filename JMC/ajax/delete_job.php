<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
date_default_timezone_set('Asia/Manila');
#region Initialize Variables
$trID='';
$dbCol="drawingreference";
if(isset($_REQUEST['trID'])){
    $trID=$_REQUEST['trID'];
}
$empID=NULL;
if(!empty($_POST['empID'])){
    $empID=$_POST['empID'];
}
$timeDelete=date("Y-m-d H:i:s");
$deleteLog=$empID."_".$timeDelete;
#endregion
#region Delete Query
$deleteQ="UPDATE drawingreference SET fldDelete=:deleteLog,fldPriority=0 WHERE fldID=:trID";
$deleteStmt=$connwebjmr->prepare($deleteQ);
$deleteStmt->execute([":trID"=>$trID,":deleteLog"=>$deleteLog]);
#endregion

// require_once 'updateprio.php';

?>