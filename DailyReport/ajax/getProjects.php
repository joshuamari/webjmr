<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$output="<option value='' selected disabled>Select Project...</option>";
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
#endregion
#region MyGroup Query
if($empGroup!=''){
    $projQ="SELECT * FROM projectstable WHERE (fldGroup IS NULL OR fldGroup=:empGroup) AND fldActive=1 AND fldDelete=0 ORDER BY fldDirect DESC,fldPriority";
    $projStmt=$connwebjmr->prepare($projQ);
    $projStmt->execute([":empGroup"=>$empGroup]);
    $projArr=$projStmt->fetchAll();
    foreach($projArr AS $projs){
        $projName=$projs['fldProject'];
        $projID=$projs['fldID'];
        $output.="<option proj-id='$projID'>$projName</option>";
    }
}
#endregion
echo $output;
?>