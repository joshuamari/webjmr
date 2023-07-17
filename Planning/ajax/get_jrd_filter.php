<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
// $output="<option value selected>Group</option>";
$output = array();
$getPlanner = NULL;
if(!empty($_POST['getPlanner'])){
    $getPlanner = $_POST['getPlanner'];
}
#endregion

#region main
$jrdQ="SELECT DISTINCT dr.fldJob AS jobName FROM planning AS pl JOIN drawingreference AS dr ON pl.fldJob=dr.fldID WHERE pl.fldPlanner=:getPlanner ORDER BY dr.fldJob";
$jrdStmt = $connwebjmr -> prepare($jrdQ);
$jrdStmt -> execute([":getPlanner" => $getPlanner]);
if($jrdStmt -> rowCount()>0){
    $jrdArr = $jrdStmt -> fetchAll();
    foreach($jrdArr AS $jrds){
        array_push($output, $jrds['jobName']);
    }
}
#endregion

#region function

#endregion

echo json_encode($output);
?>