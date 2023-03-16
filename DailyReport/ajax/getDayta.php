<?php
#region Require Database Connections
require_once "../Includes/dbconnectwebjmr.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$getDate=date("Y-m-d");
if(!empty($_POST['getDate'])){
    $getDate=$_POST['getDate'];
}
$empNum='';
if(!empty($_POST['empNum'])){
    $empNum=$_POST['empNum'];
}
$output=array();
$projs=array();
$projQ="SELECT DISTINCT(fldProject) FROM dailyreport WHERE fldDate='$getDate' AND fldEmployeeNum='$empNum'";
$projStmt=$connwebjmr->query($projQ);
$projArr=$projStmt->fetchAll();
if($projStmt->rowCount()>0){
    foreach($projArr AS $projectID){
        $proj=$projectID['fldProject'];
        array_push($projs,$proj);
    }
}
#endregion

#region main
foreach($projs AS $prj){
    $projHoursQ="SELECT pt.fldProject AS projName,SUM(dr.fldDuration) AS projMinute FROM dailyreport AS dr LEFT OUTER JOIN projectstable AS pt ON dr.fldProject=pt.fldID WHERE dr.fldDate='$getDate' AND dr.fldEmployeeNum='$empNum' AND dr.fldProject='$prj'";
    $projHoursStmt=$connwebjmr->query($projHoursQ);
    $projHArr=$projHoursStmt->fetchAll();
    if($projHoursStmt->rowCount()>0){
        foreach($projHArr AS $prjHN){
            $projName=$prjHN['projName'];
            $projMinute=$prjHN['projMinute'];
            $projHour=$projMinute/60;
            array_push($output,"$projName||$projHour");
        }
    }

}
#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($output);
?>