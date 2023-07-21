<?php
#region DB Connect
require_once "../Includes/dbconnectkdtph.php";
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$output='';
$projID='';
if(isset($_REQUEST['projID'])){
    $projID=$_REQUEST['projID'];
}
#endregion
#region MyGroup Query
$sharedProjects="";
$spQ="SELECT * FROM project_share WHERE fldProject='$projID'";
$spStmt=$connwebjmr->query($spQ);
if($spStmt->rowCount()>0){
    $spArr=$spStmt->fetchAll();
    $arrValues = array_column($spArr, "fldEmployeeNum");
    $implodeString = implode("','",array_values($arrValues));
    $sharedProjects="('" . $implodeString . "')";
    
    $myGroupQ="SELECT CONCAT(fldSurname,', ',fldFirstname) AS empname,fldGroup,fldEmployeeNum FROM emp_prof WHERE fldNick<>'' AND fldActive=1 AND fldEmployeeNum IN $sharedProjects ORDER BY fldEmployeeNum";
    $myGroupStmt=$connkdt->query($myGroupQ);
    $myGroupArr=$myGroupStmt->fetchAll();
    foreach($myGroupArr AS $myGroups){
        $eid=$myGroups['fldEmployeeNum'];
        $ename=$myGroups['empname'];
        $egroup=$myGroups['fldGroup'];
        $output.=<<<EOD
        <tr id=a_$eid>
            <td>$ename</td>
            <td>$egroup</td>
            <td><button class="btn btn-danger removeAccess" title="remove"><i class="bx bx-trash fs-5"></i></button></td>
        </tr>
        EOD;
    }
}
else{
    $output="<tr ><td colspan='3'class='text-center py-5 '>Not shared</td></tr>";
}
#endregion
echo $output;
?>