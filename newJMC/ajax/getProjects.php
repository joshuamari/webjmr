<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
$action='';
if(isset($_REQUEST['action'])){
    $action=$_REQUEST['action'];
}
$projects=array();
$output="";
$count="";
#endregion
#region Projects Query
if($_POST['action']=='fets'){
    
    $projectsQ="SELECT * FROM projectstable WHERE fldDirect=1 AND fldGroup='$empGroup' AND fldDelete=0 ORDER BY fldActive DESC,fldPriority ASC";
    $projectsStmt=$connwebjmr->query($projectsQ);
    $projArr=$projectsStmt->fetchAll();
    if(count($projArr)>0){
        $count=1;
        foreach($projArr AS $projs){
            
            $j_id = $projs['fldID'];
            $j_proj = $projs['fldProject'];
            $j_order = $projs['fldOrder'];
            $j_buic = $projs['fldBUIC'];
            $j_group = $projs['fldGroup'];
            $j_active = $projs['fldActive'];
            $j_prio = $projs['fldPriority'];
            $j_delete = $projs['fldDelete'];
        
            $output.="<tr data-id=".$j_id."><td>".$count."</td><td>".$j_proj."</td><td>".$j_order."</td><td>".$j_buic."</td><td>".$j_group."</td><td>".$j_active."</td></tr>";
            $count++;
            }
          
    }
}

if($_POST['action']=='update'){
    for($count = 0; $count<count($_POST["prio_array"]); $count++){
        $query = "UPDATE projectstable SET fldPriority='".($count+1)."' WHERE fldID = '".$_POST['prio_array'][$count]."'";
        $statement=$connect->prepare($query);
        $statement->execute();
        
    }
}
#endregion
echo $output;
?>