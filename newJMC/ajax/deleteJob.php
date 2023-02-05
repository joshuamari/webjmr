<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$trID='';
$dbCol="drawingreference";
if(isset($_REQUEST['trID'])){
    $trID=$_REQUEST['trID'];
}
#endregion
#region Delete Query
$deleteQ="UPDATE drawingreference SET fldDelete=1,fldPriority=0 WHERE fldID=:trID";
$deleteStmt=$connwebjmr->prepare($deleteQ);
$deleteStmt->execute([":trID"=>$trID]);
#endregion

// require_once 'updateprio.php';

?>