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
$empNum='';
if(isset($_REQUEST['empNum'])){
    $empNum=$_REQUEST['empNum'];
}
$sharedProjects="(";
$spQ="SELECT * FROM project_share WHERE fldEmployeeNum='$empNum'";
$spStmt=$connwebjmr->query($spQ);
if($spStmt->rowCount()>0){
    $spArr=$spStmt->fetchAll();
    foreach($spArr AS $sps){
        $sp=$sps['fldProject'];
        $sharedProjects.="'$sp',";
    }
}
$sharedProjects=rtrim($sharedProjects,',');
$sharedProjects.=")";
#endregion
#region MyGroup Query
$itemQ="SELECT * FROM itemofworkstable WHERE fldProject=:projID AND fldActive=1 AND (fldGroup=:empGroup OR fldGroup IS NULL OR fldProject IN $sharedProjects) AND fldDelete=0 ORDER BY fldPriority";
echo $itemQ;
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