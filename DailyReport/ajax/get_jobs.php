<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "./global_var.php";
#endregion
#region Initialize Variable
$jobsArray = array();
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
$projID='';
if(isset($_REQUEST['projID'])){
    $projID=$_REQUEST['projID'];
}
$itemID='';
if(isset($_REQUEST['itemID'])){
    $itemID=$_REQUEST['itemID'];
}
$statement=" AND fldItem=$itemID";
if($projID==$trainProjID){
    $statement=" AND fldItem IS NULL";
}
$empNum='';
if(isset($_REQUEST['empNum'])){
    $empNum=$_REQUEST['empNum'];
}
$sharedProjects="";
$spQ="SELECT * FROM project_share WHERE fldEmployeeNum='$empNum'";
$spStmt=$connwebjmr->query($spQ);
if($spStmt->rowCount()>0){
    $spArr=$spStmt->fetchAll();
    $arrValues = array_column($spArr, "fldProject");
    $implodeString = implode("','",array_values($arrValues));
    $sharedProjects="OR fldProject IN ('" . $implodeString . "')";
}
$searchjrd='';
if(!empty($_POST['searchjrd'])){
    $searchjrd=$_POST['searchjrd'];
}
#endregion
#region MyGroup Query
if($itemID!=''){
    $jobQ="SELECT * FROM drawingreference WHERE fldProject=:projID $statement AND fldActive=1 AND (fldGroup=:empGroup OR fldGroup IS NULL $sharedProjects) AND fldDelete=0 AND fldJob LIKE '%$searchjrd%' ORDER BY fldPriority";
    $jobStmt=$connwebjmr->prepare($jobQ);
    $jobStmt->execute([":projID"=>$projID,":empGroup"=>$empGroup]);
    $jobArr=$jobStmt->fetchAll();
    foreach($jobArr AS $job){
        $output = array();
        $jobName=$job['fldJob'];
        $jobID=$job['fldID'];

        $output += ["jobID" => $jobID];
        $output += ["jobName" => $jobName];
        array_push($jobsArray, $output);
    }
}
#endregion
echo json_encode($jobsArray);
?>