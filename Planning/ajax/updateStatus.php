<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$dateCurrent=date("Y-m-d H:i:s");
$planID=NULL;
if(!empty($_POST['planID'])){
    $planID=$_POST['planID'];
}
#endregion

#region Entries Query
$updateQ="UPDATE planning SET fldStatus=:dateCurrent WHERE fldID=:planID";
$updateStmt=$connwebjmr->prepare($updateQ);
$updateStmt->execute([":dateCurrent"=>$dateCurrent,":planID"=>$planID]);
#endregion
echo "test";
?>