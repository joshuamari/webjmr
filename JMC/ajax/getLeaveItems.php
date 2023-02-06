<?php
#region Database Connection
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$leaveItems=array();
#endregion
#region Defaults Query
$leaveItemsQ="SELECT * FROM itemofworkstable WHERE fldProject=5 AND fldGroup IS NULL";
$leaveItemsStmt=$connwebjmr->query($leaveItemsQ);
$liArr=$leaveItemsStmt->fetchAll();
foreach($liArr AS $lItems){
    array_push($leaveItems,$lItems['fldItem']."||p_".$lItems['fldID']);
}
echo json_encode($leaveItems);
#endregion
?>