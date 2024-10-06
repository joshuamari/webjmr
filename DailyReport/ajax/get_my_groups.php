<?php
#region DB Connect
require_once "../Includes/dbconnectkdtph.php";
#endregion
#region Initialize Variable
$output="<option value='' selected hidden>Select Group</option>";
$empNum='';
if(isset($_REQUEST['empNum'])){
    $empNum=$_REQUEST['empNum'];
}
#endregion
#region MyGroup Query
$myGroupQ="SELECT * FROM emp_prof WHERE fldEmployeeNum='$empNum'";
$myGroupStmt=$connkdt->query($myGroupQ);
$myGroupArr=$myGroupStmt->fetchAll();
foreach($myGroupArr AS $myGroups){
    if($myGroups['fldGroups']!=''){
        $groupsArr=explode("/",$myGroups['fldGroups']);
        foreach($groupsArr AS $grps){
            $output.="<option>$grps</option>";
        }
    }
    else{
        $output.="<option>".$myGroups['fldGroup']."</option>";
    }
}
#endregion
echo json_encode($output);
?>