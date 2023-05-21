<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$output=array();
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
$kdtw='';
if(!in_array($empGroup,$KDTWAccess)){
    $kdtw=" AND fldID<>'$solProjID'";
}
$empPos='';
if(isset($_REQUEST['empPos'])){
    $empPos=$_REQUEST['empPos'];
}
$empNum='';
if(isset($_REQUEST['empNum'])){
    $empNum=$_REQUEST['empNum'];
}
$mngStatement="";
if(!in_array($empPos,$managementPositions) && !in_array($empNum,$gods)){
    $mngStatement=" AND fldID<>'$mngProjID'";
}
$sharedProjects="OR fldID IN (";
$spQ="SELECT * FROM project_share WHERE fldEmployeeNum='$empNum'";
$spStmt=$connwebjmr->query($spQ);
if($spStmt->rowCount()>0){
    $spArr=$spStmt->fetchAll();
    foreach($spArr AS $sps){
        $sp=$sps['fldProject'];
        $sharedProjects.="'$sp',";
    }
    $sharedProjects=rtrim($sharedProjects,',');
    $sharedProjects.=")";
}
else{
    $sharedProjects="";
}
$searchProj='';
if(!empty($_POST['searchProj'])){
    $searchProj=$_POST['searchProj'];
}
#endregion
#region MyGroup Query
if($empGroup!=''){
    $projQ="SELECT * FROM projectstable WHERE (fldGroup IS NULL OR fldGroup=:empGroup $sharedProjects) AND fldActive=1 AND fldDelete=0 $kdtw $mngStatement AND fldProject LIKE '%$searchProj%' ORDER BY fldDirect DESC,fldPriority";
    $projStmt=$connwebjmr->prepare($projQ);
    $projStmt->execute([":empGroup"=>$empGroup]);
    $projArr=$projStmt->fetchAll();
    foreach($projArr AS $projs){
        $groupAppend="";
        $projGroup=$projs['fldGroup'];
        if($projGroup!=$empGroup AND $projGroup!=NULL){
            $groupAppend="($projGroup)";
        }
        $projName=$projs['fldProject'];
        $projID=$projs['fldID'];
        // $output.="<option proj-id='$projID'>$projName$groupAppend</option>";

        array_push($output,"$projID||$projName||$groupAppend");
    }
}
#endregion
echo json_encode($output);
?>