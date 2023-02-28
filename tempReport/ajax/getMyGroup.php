<?php
#region DB Connect
require_once "../Includes/dbconnectkdtph.php";
#endregion
#region Initialize Variable
$output="<option value=''>ALL</option>";
$empNum='';
if(isset($_REQUEST['empNum'])){
    $empNum=$_REQUEST['empNum'];
}
#endregion
#region MyGroup Query
if(in_array($empNum,$allAccess)){
    $groupsQuery= "SELECT * FROM kdtbu WHERE fldDepartment<>'' ORDER BY fldBU";
    $groupsStmt = $connkdt->query($groupsQuery);
    while($rowgrp = $groupsStmt->fetch()){
        $grp=$rowgrp['fldBU'];
        $output.='<option>'.$rowgrp['fldBU'].'</option>';
    }
}
else{
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
            $output="<option>".$myGroups['fldGroup']."</option>";
        }
    }
}

#endregion
echo $output;
?>