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
$projQ="SELECT DISTINCT pt.fldProject AS projName FROM planning AS pl JOIN drawingreference AS dr ON pl.fldJob=dr.fldID JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN itemofworkstable AS it ON dr.fldItem=it.fldID WHERE pl.fldPlanner=:getPlanner ORDER BY pt.fldProject";
$projStmt = $connwebjmr -> prepare($projQ);
$projStmt -> execute([":getPlanner" => $getPlanner]);
if($projStmt -> rowCount()>0){
    $projArr = $projStmt -> fetchAll();
    foreach($projArr AS $projs){
        array_push($output, $projs['projName']);
    }
}
#endregion

#region function

#endregion

echo json_encode($output);
?>