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
if($empGroup!=''){
    $projQ="SELECT * FROM projectstable WHERE (fldGroup IS NULL OR fldGroup=:empGroup OR fldID IN $sharedProjects) AND fldActive=1 AND fldDelete=0 ORDER BY fldDirect DESC,fldPriority";
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