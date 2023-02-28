<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
$kdtw="";
if(!in_array($empGroup,$KDTWAccess)){
    $kdtw=" AND fldID<>'2'";
}
$projects=array();
$prioq="SELECT MAX(fldPriority) FROM projectstable WHERE fldActive='1' AND fldGroup='$empGroup'";
$priostmt=$connwebjmr->query($prioq);
$maxPrio=$priostmt->fetchColumn();
#endregion
#region Projects Query
$projectsQ="SELECT * FROM projectstable WHERE (fldGroup IS NULL OR fldGroup='$empGroup') AND fldDelete=0 $kdtw ORDER BY fldPriority DESC,fldActive DESC";
$projectsStmt=$connwebjmr->query($projectsQ);
$projArr=$projectsStmt->fetchAll();
if(count($projArr)>0){
    foreach($projArr AS $projs){
        array_push($projects,$projs['fldProject']."||".$projs['fldID']."||".$projs['fldOrder']."||".$projs['fldBUIC']."||".$projs['fldActive']."||".$projs['fldPriority']);
    }
}
#endregion
echo json_encode($projects);
?>