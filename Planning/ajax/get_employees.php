<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$projID=NULL;
if(!empty($_POST['projID'])){
    $projID=$_POST['projID'];
}
$searchEmp='';
if(!empty($_POST['searchemp'])){
    $searchEmp=$_POST['searchemp'];
}
$empDeets=array();
$groupQ="SELECT fldGroup FROM projectstable WHERE fldID=:projID";
$groupStmt=$connwebjmr->prepare($groupQ);
$groupStmt->execute([":projID"=>$projID]);
$projGroup=$groupStmt->fetchColumn();
$mgaHiniram="";
$hiramQ="SELECT * FROM project_share WHERE fldProject=:projID";
$hiramStmt=$connwebjmr->prepare($hiramQ);
$hiramStmt->execute([":projID"=>$projID]);
if($hiramStmt->rowCount()>0){
    $mgaHiniram=" OR fldEmployeeNum IN (";
    $hiramArr=$hiramStmt->fetchAll();
    foreach($hiramArr AS $hiram){
        $mgaHiniram.=$hiram['fldEmployeeNum'].",";
    }
    $mgaHiniram=rtrim($mgaHiniram,",");
    $mgaHiniram.=")";
}


#endregion

#region main
$empsQ="SELECT CONCAT(fldSurname,', ',fldFirstName) AS ename,fldEmployeeNum FROM emp_prof WHERE (fldGroup=:projGroup $mgaHiniram) AND fldActive=1 AND fldNick<>'' AND fldName LIKE '%$searchEmp%'";             ;
$empsStmt=$connkdt->prepare($empsQ);
$empsStmt->execute([":projGroup"=>$projGroup]);
if($empsStmt->rowCount()>0){
    $empArr=$empsStmt->fetchAll();
    foreach($empArr AS $emp){
        $empname=$emp['ename'];
        $empnum=$emp['fldEmployeeNum'];
        array_push($empDeets,"$empnum||$empname");
    }
}
#endregion

#region function

#endregion
echo json_encode($empDeets)
//$.ajaxSetup({async: false});
?>