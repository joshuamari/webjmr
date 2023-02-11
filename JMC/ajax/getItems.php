<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
$selProj='';
if(isset($_REQUEST['selProj'])){
    $selProj=$_REQUEST['selProj'];
}
$items=array();
$prioq="SELECT MAX(fldPriority) FROM itemofworkstable WHERE fldActive='1' AND fldGroup='$empGroup' AND fldProject='$selProj'";
$priostmt=$connwebjmr->query($prioq);
$maxPrio=$priostmt->fetchColumn();
#endregion
#region Items Query
$itemsQ="SELECT * FROM itemofworkstable WHERE fldProject='$selProj' AND fldGroup='$empGroup' AND fldDelete=0 ORDER BY fldPriority DESC,fldActive DESC";
$itemsStmt=$connwebjmr->query($itemsQ);
$itemsArr=$itemsStmt->fetchAll();
if(count($itemsArr)>0){
    foreach($itemsArr as $itms){
        array_push($items,$itms['fldItem']."||".$itms['fldID']."||".$itms['fldActive']."||".$itms['fldPriority']);
    }
}
#endregion
echo json_encode($items);
?>