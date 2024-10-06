<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$output="";
$itemID='';
if(!empty($_REQUEST['itemID'])){
    $itemID=$_REQUEST['itemID'];
}
#endregion
#region MyGroup Query
$labelQ="SELECT fldLabel FROM itemlabels WHERE fldItem='$itemID'";
$labelStmt=$connwebjmr->query($labelQ);
if($labelStmt->rowCount()>0){
    $output=$labelStmt->fetchColumn();
}
#endregion
echo $output;
?>