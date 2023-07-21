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
$lastDay=date("Y-m-16");
$ymSel=$firstDay;
if(!empty($_REQUEST['getYMSel'])){
    $ymSel=$_REQUEST['getYMSel'];
}
$firstDay=date("Y-m-01",strtotime($ymSel));
$lastDay=date("Y-m-16",strtotime($ymSel));
$cutOff="1";
if(isset($_REQUEST['getHalfSel'])){
    $cutOff=$_REQUEST['getHalfSel'];
}
switch($cutOff){
    case "3":
        $lastDay=date('Y-m-d',strtotime($firstDay.'+ 1 month')); 
        break;
    case "4":
        $firstDay = date('Y-m-d', strtotime('last week'));
        $lastDay = date('Y-m-d', strtotime('last week +6 days'));
        break;
    case "5":
        $firstDay = date('Y-m-d', strtotime('this week'));
        $lastDay = date('Y-m-d', strtotime('this week +6 days'));
        break;
}
$dateCompare=" AND fldDate >= '$firstDay' AND fldDate<'$lastDay'";
$hiram=array();
$projExcept = $defaultProjID;
$proj="";
$projsQ="SELECT DISTINCT(dr.fldProject) FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID WHERE (dr.fldProject IN (SELECT fldID FROM projectstable WHERE fldGroup='$rawGetGroup')) $dateCompare";
$projStmt=$connwebjmr->prepare($projsQ);
$projStmt->execute();
if($projStmt->rowCount()>0){
    $projsArr=$projStmt->fetchAll();
    foreach($projsArr AS $projs){
        $projID=$projs['fldProject'];
        $projExcept[] = $projID;
    }
}
$implodeString = implode("','",$projExcept);
$proj=" AND dr.fldProject NOT IN ('" . $implodeString . "')";


#endregion

#region main
$mgaEmpStmt='';
$mgaEmpNgBU="";
$arrValue = [];
$empNgBUQ="SELECT DISTINCT(fldEmployeeNum) FROM emp_prof WHERE fldGroup='$rawGetGroup' AND fldNick<>'' AND fldActive=1 AND fldDesig<>'DM'";
$empNgBUStmt=$connkdt->prepare($empNgBUQ);
$empNgBUStmt->execute();
if($empNgBUStmt->rowCount()>0){
    $enbArr=$empNgBUStmt->fetchAll();
    foreach($enbArr AS $enbs){
        $arrValue[] = $enbs['fldEmployeeNum'];
    }
    $implodeString = implode("','",$arrValue);
    $mgaEmpNgBU="('" . $implodeString . "')";
    $mgaEmpStmt="AND fldEmployeeNum NOT IN";
}
$empsQ="SELECT DISTINCT(fldEmployeeNum) FROM dailyreport WHERE (fldProject='$mngProjID' AND fldGroup='$rawGetGroup') $mgaEmpStmt $mgaEmpNgBU $dateCompare";
$empsStmt=$connwebjmr->prepare($empsQ);
$empsStmt->execute();
if($empsStmt->rowCount()>0){
    $empsArr=$empsStmt->fetchAll();
    foreach($empsArr AS $emps){
        $arrValue[] = $emps['fldEmployeeNum'];
    }
    $implodeString = implode("','",$arrValue);
    $mgaEmpNgBU="('" . $implodeString . "')";
}
if(empty($mgaEmpNgBU)){
    $mgaEmpNgBU="('')";
}
//grp||proj Code||Proj Name||Location(P/J)||dbIndex
$hiramQ="SELECT pt.fldGroup,pt.fldOrder,pt.fldProject,dl.fldCode AS locCode,dr.fldEmployeeNum,dr.fldTrGroup,dr.fldProject AS projID FROM dailyreport AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN dispatch_locations AS dl ON dl.fldID=dr.fldLocation WHERE ((dr.fldGroup='$rawGetGroup' AND dr.fldTrGroup IS NOT NULL) OR dr.fldEmployeeNum IS NOT NULL $proj AND fldEmployeeNum IN $mgaEmpNgBU) $dateCompare  GROUP BY dr.fldProject,locCode";
$hiramStmt=$connwebjmr->prepare($hiramQ);
$hiramStmt->execute();
if($hiramStmt->rowCount()>0){
    $hiramArr=$hiramStmt->fetchAll();
    foreach($hiramArr AS $hirams){
        $pGroup = $hirams['fldGroup'];
        if($pGroup==NULL){
            $pGroup = $hirams['fldTrGroup'];
        }
        $projID=$hirams['projID'];
        $pOrder = $hirams['fldOrder'];
        $pName = $hirams['fldProject'];
        $locCode = ($hirams['locCode']==0) ? 'P':'J';
        if(!in_array("$pGroup||$pOrder||$pName||$locCode||$projID-$locCode",$hiram)){
            array_push($hiram,"$pGroup||$pOrder||$pName||$locCode||$projID-$locCode");
        }
    }
}


#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
echo json_encode($hiram);
// echo $hiramQ;
?>