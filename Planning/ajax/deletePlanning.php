<?php
#region Require Database Connections
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$planID=NULL;
if(!empty($_POST['planID'])){
    $planID=$_POST['planID'];
}
#endregion

#region main
$plansQ="DELETE FROM planning WHERE fldID=:planID";
$plansStmt=$connwebjmr->prepare($plansQ);
$plansStmt->execute([":planID"=>$planID]);

#endregion

#region function

#endregion

?>