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
$itemQ="SELECT DISTINCT it.flditem AS itemName FROM planning AS pl JOIN drawingreference AS dr ON pl.fldJob=dr.fldID JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN itemofworkstable AS it ON dr.fldItem=it.fldID WHERE pl.fldPlanner=:getPlanner ORDER BY it.fldItem";
$itemStmt = $connwebjmr -> prepare($itemQ);
$itemStmt -> execute([":getPlanner" => $getPlanner]);
if($itemStmt -> rowCount()>0){
    $itemArr = $itemStmt -> fetchAll();
    foreach($itemArr AS $items){
        array_push($output, $items['itemName']);
    }
}
#endregion

#region function

#endregion

echo json_encode($output);
?>