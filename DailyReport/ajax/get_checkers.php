<?php
#region Require Database Connections
require_once "../../dbconn/dbconnectkdtph.php";
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "./global_var.php";
#endregion
#region Initialize Variables
$output="<option value='' selected disabled>Select...</option>";
$empNum='';
if(isset($_REQUEST['empNum'])){
    $empNum=$_REQUEST['empNum'];
}
$empGrp='';
if(isset($_REQUEST['empGrp'])){
    $empGrp=getGroup($_REQUEST['empGrp']);
}
$projID='';
if(!empty($_REQUEST['projID'])){
    $projID=$_REQUEST['projID'];
    if(!in_array($projID,$defaultProjID)){
        $projGroupQ="SELECT fldGroup FROM projectstable WHERE fldID='$projID'";
        $projGroupStmt=$connwebjmr->query($projGroupQ);
        $projGroup=$projGroupStmt->fetchColumn();
        $empGrp=$projGroup;
    }
}
$sharedEmp="";
$spQ="SELECT fldEmployeeNum FROM project_share WHERE fldProject='$projID'";
$spStmt=$connwebjmr->query($spQ);
if($spStmt->rowCount()>0){
    $spArr=$spStmt->fetchAll();
    $arrValues = array_column($spArr, "fldEmployeeNum");
    $implodeString = implode("','",array_values($arrValues));
    $sharedEmp="OR fldEmployeeNum IN ('" . $implodeString . "')";
}
#endregion
#region Query Members
$memQ = "SELECT * FROM emp_prof WHERE fldEmployeeNum<>'$empNum' AND (fldGroup='$empGrp' $sharedEmp) AND fldActive=1 AND fldNick<>''";
$memStmt=$connkdt->query($memQ);
$memArr=$memStmt->fetchAll();
foreach($memArr AS $mem){
    $memberid=$mem['fldEmployeeNum'];
    $member=$mem['fldFirstname']." ".$mem['fldSurname'];
    $output .= "<option class='member' dataid='$memberid'>$member</option>";
}

#endregion
echo $output;
?>