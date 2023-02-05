<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$output="<option value='' selected disabled>Select Item of Works</option>";
$projID='';
if(isset($_REQUEST['projID'])){
    $projID=$_REQUEST['projID'];
}
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
#endregion
#region MyGroup Query
$itemQ="SELECT * FROM itemofworkstable WHERE fldProject=:projID AND fldActive=1 AND (fldGroup=:empGroup OR fldGroup IS NULL) AND fldDelete=0 ORDER BY fldPriority";
$itemStmt=$connwebjmr->prepare($itemQ);
$itemStmt->execute([":projID"=>$projID,":empGroup"=>$empGroup]);
$itemArr=$itemStmt->fetchAll();
foreach($itemArr AS $item){
    $itemName=$item['fldItem'];
    $itemID=$item['fldID'];
    $output.="<option item-id='$itemID'>$itemName</option>";
}
#endregion
echo $output;
?>