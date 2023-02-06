<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
$projects=array();
$prioq="SELECT MAX(fldPriority) FROM projectstable WHERE fldActive='1' AND fldGroup='$empGroup'";
$priostmt=$connwebjmr->query($prioq);
$maxPrio=$priostmt->fetchColumn();
#endregion
#region Projects Query
$projectsQ="SELECT * FROM projectstable WHERE fldDirect=1 AND fldGroup='$empGroup' AND fldDelete=0 ORDER BY fldActive DESC,fldPriority ASC";
$projectsStmt=$connwebjmr->query($projectsQ);
$projArr=$projectsStmt->fetchAll();
if(count($projArr)>0){
    foreach($projArr AS $projs){
        array_push($projects,$projs['fldProject']."||p_".$projs['fldID']."||".$projs['fldOrder']."||".$projs['fldBUIC']."||".$projs['fldActive']."||".$projs['fldPriority']."||".$maxPrio);
    }
}
#endregion
echo json_encode($projects);
?>