<?php
#region DB Connect
require_once "../Includes/dbconnectkdtph.php";
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$output='<option value="" selected disabled>Select Employee</option>';
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
$projID='';
if(isset($_REQUEST['projID'])){
    $projID=$_REQUEST['projID'];
}
$sharedProjects="";
$spQ="SELECT * FROM project_share WHERE fldProject='$projID'";
$spStmt=$connwebjmr->query($spQ);
if($spStmt->rowCount()>0){
    $spArr=$spStmt->fetchAll();
    $arrValues = array_column($spArr, "fldEmployeeNum");
    $implodeString = implode("','",array_values($arrValues));
    $sharedProjects="AND fldEmployeeNum NOT IN ('" . $implodeString . "')";
}
#endregion
#region MyGroup Query
$myGroupQ="SELECT CONCAT(fldSurname,' ',fldFirstname) AS empname,fldEmployeeNum FROM emp_prof WHERE fldGroup='$empGroup' AND fldNick<>'' AND fldActive=1 $sharedProjects ORDER BY fldEmployeeNum";
$myGroupStmt=$connkdt->query($myGroupQ);
$myGroupArr=$myGroupStmt->fetchAll();
foreach($myGroupArr AS $myGroups){
    $output.="<option e-id='".$myGroups['fldEmployeeNum']."'>".$myGroups['empname']."</option>";
}
#endregion
echo $output;
?>