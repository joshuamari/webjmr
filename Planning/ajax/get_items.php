<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
// $output="<option value='' selected hidden>Select Item of Works</option>";
$output=array();
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
$sharedProjects="";
$spQ="SELECT * FROM project_share WHERE fldEmployeeNum='$empNum'";
$spStmt=$connwebjmr->query($spQ);
if($spStmt->rowCount()>0){
    $spArr=$spStmt->fetchAll();
    $arrValues = array_column($spArr, "fldProject");
    $implodeString = implode("','",array_values($arrValues));
    $sharedProjects="OR fldProject IN ('" . $implodeString . "')";
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
        case 'CTE':
            $mngStatement=" AND fldID=4";
            break;
        case 'SSV':
            $mngStatement=" AND fldID=5";
            break;
        case 'SSS':
            $mngStatement=" AND fldID=5";
            break;
    }
}
$searchIOW='';
if(!empty($_POST['searchIOW'])){
    $searchIOW=$_POST['searchIOW'];
}
#endregion
#region MyGroup Query
$itemQ="SELECT * FROM itemofworkstable WHERE fldProject=:projID AND fldActive=1 AND (fldGroup=:empGroup OR fldGroup IS NULL $sharedProjects) AND fldDelete=0 $mngStatement AND fldItem LIKE '%$searchIOW%' ORDER BY fldPriority";
$itemStmt=$connwebjmr->prepare($itemQ);
$itemStmt->execute([":projID"=>$projID,":empGroup"=>$empGroup]);
$itemArr=$itemStmt->fetchAll();
foreach($itemArr AS $item){
    $itemName=$item['fldItem'];
    $itemID=$item['fldID'];
    // $output.="<option item-id='$itemID'>$itemName</option>";
    // $output.="<li item-id='$itemID'>$itemName</li>";
    array_push($output,"$itemID||$itemName");
}
#endregion
echo json_encode($output);
?>