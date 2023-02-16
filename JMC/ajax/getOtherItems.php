<?php
#region Database Connection
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$otherItems=array();
#endregion
#region Defaults Query
$otherItemsQ="SELECT * FROM itemofworkstable WHERE fldProject=4 AND fldGroup IS NULL";
$otherItemsStmt=$connwebjmr->query($otherItemsQ);
$otArr=$otherItemsStmt->fetchAll();
foreach($otArr AS $otItems){
    array_push($otherItems,$otItems['fldItem']."||p_".$otItems['fldID']);
}
echo json_encode($otherItems);
#endregion
?>