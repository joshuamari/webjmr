<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$trID='';
if(isset($_REQUEST['trID'])){
    $trID=$_REQUEST['trID'];
}
#endregion
#region Delete Query
$deleteQ="DELETE FROM dailyreport WHERE fldID=:trID";
$deleteStmt=$connwebjmr->prepare($deleteQ);
$deleteStmt->execute([":trID"=>$trID]);
#endregion
?>