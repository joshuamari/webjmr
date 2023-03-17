<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$output="<option value='' selected disabled>Select...</option>";
$empNum='';
if(isset($_REQUEST['empNum'])){
    $empNum=$_REQUEST['empNum'];
}
$empGrp='';
if(isset($_REQUEST['empGrp'])){
    $empGrp=$_REQUEST['empGrp'];
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
$spQ="SELECT * FROM project_share WHERE fldProject='$projID'";
$spStmt=$connwebjmr->query($spQ);
if($spStmt->rowCount()>0){
    $sharedEmp="OR fldEmployeeNum IN (";
    $spArr=$spStmt->fetchAll();
    foreach($spArr AS $sps){
        $sp=$sps['fldEmployeeNum'];
        $sharedEmp.="'$sp',";
    }
    $sharedEmp=rtrim($sharedEmp,',');
    $sharedEmp.=")";
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