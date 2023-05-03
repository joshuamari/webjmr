<?php
#region DB Connect
require_once "../Includes/dbconnectkdtph.php";
require_once '../Includes/dbconnectwebjmr.php';
#endregion
#region Initialize Variable
$output=array();
$empNum='';
if(isset($_REQUEST['empNum'])){
    $empNum=$_REQUEST['empNum'];
}
#endregion
#region MyGroup Query
if(in_array($empNum,$reportAllGroupAccess)){
    $allGroupQ="SELECT fldBU FROM kdtbu WHERE fldDepartment IS NOT NULL AND fldBU NOT IN ('SHI') ORDER BY fldBU";
    $allGroupStmt=$connkdt->query($allGroupQ);
    if($allGroupStmt->rowCount()>0){
        $allGroupArr=$allGroupStmt->fetchAll();
        foreach($allGroupArr AS $allGroups){
            $allGroup=$allGroups['fldBU'];
            array_push($output,$allGroup);
        }
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
                array_push($output,$grps);
            }
        }
        else{
            $grp=$myGroups['fldGroup'];
            array_push($output,$grp);
        }
    }
}

#endregion
echo json_encode($output)
?>