<?php
#region DB Connect
require_once "../Includes/dbconnectkdtph.php";
#endregion
#region Initialize Variable
$output='<option value="" selected disabled>Select Group</option>';
$empGroup='';
if(isset($_REQUEST['empGroup'])){
    $empGroup=$_REQUEST['empGroup'];
}
#endregion
#region MyGroup Query
$myGroupQ="SELECT * FROM kdtbu WHERE fldBU<>'$empGroup' AND fldDepartment IS NOT NULL ORDER BY fldBU";
$myGroupStmt=$connkdt->query($myGroupQ);
$myGroupArr=$myGroupStmt->fetchAll();
foreach($myGroupArr AS $myGroups){
    $output.="<option>".$myGroups['fldBU']."</option>";
}
#endregion
echo $output;
?>