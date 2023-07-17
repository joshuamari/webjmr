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
$groupQ="SELECT DISTINCT pt.fldGroup AS projGroup FROM planning AS pl JOIN drawingreference AS dr ON pl.fldJob=dr.fldID JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN itemofworkstable AS it ON dr.fldItem=it.fldID WHERE pl.fldPlanner=:getPlanner ORDER BY pt.fldGroup";
$groupStmt = $connwebjmr -> prepare($groupQ);
$groupStmt -> execute([":getPlanner" => $getPlanner]);
if($groupStmt -> rowCount()>0){
    $groupArr = $groupStmt -> fetchAll();
    foreach($groupArr AS $grps){
        array_push($output, $grps['projGroup']);
    }
}
#endregion

#region function

#endregion

echo json_encode($output);
?>