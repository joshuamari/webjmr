<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$output="<option value='' selected hidden>Select Item of Works</option>";
$projID='';
if(!empty($_REQUEST['projID'])){
    $projID=$_REQUEST['projID'];
}
$empGroup='';
if(!empty($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
$empPos='';
if(!empty($_REQUEST['empPos'])){
    $empPos=$_REQUEST['empPos'];
}
$empNum='';
if(!empty($_REQUEST['empNum'])){
    $empNum=$_REQUEST['empNum'];
}
$sharedProjects="OR fldProject IN (";
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
$mngStatement='';
//if projID=mngID
//switch empos
//if sm, then item of works id = 1
if($projID == $mngProjID){
    switch($empPos){
        case 'SM':
            $mngStatement=" AND fldID=1";
            break;
        case 'DM':
            if(in_array($empGroup,$KDTWAccess)){
                $mngStatement=" AND fldID=2";
            }
            else{
                $mngStatement=" AND fldID=3";
            }
            break;
        case 'AM':
            $mngStatement=" AND fldID=4";
            break;
        case 'SSV':
            $mngStatement=" AND fldID=5";
            break;
        case 'SSS':
            $mngStatement=" AND fldID=5";
            break;
        case 'IT-SV':
            $mngStatement=" AND fldID=5";
            break;
    }
}
#endregion
#region MyGroup Query
$itemQ="SELECT * FROM itemofworkstable WHERE fldProject=:projID AND fldActive=1 AND (fldGroup=:empGroup OR fldGroup IS NULL $sharedProjects) AND fldDelete=0 $mngStatement ORDER BY fldPriority";
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