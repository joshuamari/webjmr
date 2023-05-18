<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';
require_once '../Includes/globalFunctions.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$getGroups=array();
$rawGetGroup='';
if(!empty($_POST['getGroup'])){
    $rawGetGroup=$_POST['getGroup'];
}
$firstDay=date("Y-m-01");
$ymSel=$firstDay;
if(!empty($_REQUEST['getYMSel'])){
    $ymSel=$_REQUEST['getYMSel'];
}
$selYearMonth=date("Y-m-01",strtotime($ymSel));
$eList=array();
#endregion

#region main

//emp#||Name
$elQ="SELECT fldEmployeeNum,CONCAT(fldSurname,', ',fldFirstname) AS ename FROM emp_prof WHERE fldGroup='$rawGetGroup' AND fldNick<>'' AND (fldResignDate IS NULL OR fldResignDate>('$selYearMonth')) ORDER BY fldEmployeeNum";
$elStmt=$connkdt->prepare($elQ);
$elStmt->execute();
if($elStmt->rowCount()>0){
    $elArr=$elStmt->fetchAll();
    foreach($elArr AS $el){
        $enum = $el['fldEmployeeNum'];
        $ename = $el['ename'];
        array_push($eList,"$enum||$ename");
    }
}
#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($eList);
// echo $elQ;
?>