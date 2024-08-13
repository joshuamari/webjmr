<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$towID="";
if(isset($_REQUEST['towID'])){
    $towID=$_REQUEST['towID'];
}
#endregion
#region Entries Query
$towQ="SELECT fldTOWDesc FROM typesofworktable WHERE fldID=:towID";
$towStmt=$connwebjmr->prepare($towQ);
$towStmt->execute([":towID"=>$towID]);
$towDesc = $towStmt->fetchColumn();
#endregion
echo $towDesc;
?>