<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "./global_var.php";
#endregion
#region Initialize Variable
$projectsArray=array();
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=getGroup($_REQUEST['empGroup']);
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
$sharedProjects="";
$spQ="SELECT * FROM project_share WHERE fldEmployeeNum='$empNum'";
$spStmt=$connwebjmr->query($spQ);
if($spStmt->rowCount()>0){
    $spArr=$spStmt->fetchAll();
    $arrValues = array_column($spArr, "fldProject");
    $implodeString = implode("','",array_values($arrValues));
    $sharedProjects="OR fldID IN ('" . $implodeString . "')";
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
        $output = array();
        $groupAppend="";
        $projGroup=$projs['fldGroup'];
        if($projGroup!=$empGroup AND $projGroup!=NULL){
            $groupAppend="($projGroup)";
        }
        $projName=$projs['fldProject'];
        $projID=$projs['fldID'];

        $output+=["projID"=>$projID];
        $output+=["projName"=>$projName];
        $output+=["groupAppend"=>$groupAppend];
        array_push($projectsArray,$output);
    }
}
#endregion
echo json_encode($projectsArray);
?>