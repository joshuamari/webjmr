<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$itemName='';
if(isset($_REQUEST['itemName'])){
    $itemName=$_REQUEST['itemName'];
}
$grp='';
if(isset($_REQUEST['grp'])){
    $grp=$_REQUEST['grp'];
}
$projID='';
if(isset($_REQUEST['projID'])){
    $projID=$_REQUEST['projID'];
}
$prioq="SELECT MAX(fldPriority) FROM itemofworkstable WHERE fldActive='1' AND fldGroup='$grp' AND fldProject='$projID'";
$priostmt=$connwebjmr->query($prioq);
$maxPrio=$priostmt->fetchColumn();
$maxPrio++;
$dupq="SELECT COUNT(*) FROM itemofworkstable WHERE fldDelete='0' AND fldGroup='$grp' AND fldProject='$projID' AND fldItem='$itemName'";
$dupstmt=$connwebjmr->query($dupq);
$dup=$dupstmt->fetchColumn();
#endregion

#region Insert Query
if($dup>0){
    echo "Duplicate Title";
}
else{
    $projQ="INSERT INTO itemofworkstable(fldProject,fldItem,fldGroup,fldPriority) VALUES (:projID,:itemName,:grp,:maxPrio)";
    $projStmt=$connwebjmr->prepare($projQ);
    $projStmt->execute([":projID"=>$projID,":itemName"=>$itemName,":grp"=>$grp,":maxPrio"=>$maxPrio]);
}
#endregion
?>