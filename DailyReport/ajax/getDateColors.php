<?php
#region Require Database Connections
require_once "../Includes/dbconnectwebjmr.php";
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$dateOrigin='2023-04-03';//edit base sa start ng official input
$curDay=date("Y-m-d");
$curFirstDay=date("Y-m-01");
$curMonth='';
if(!empty($_POST['curMonth'])){
    $curMonth=$_POST['curMonth'];
}
$empNum=464;
if(!empty($_POST['empNum'])){
    $empNum=$_POST['empNum'];
}
$startDate=$curMonth;
if(date('N', strtotime($curMonth)) != 7){
    $startDate=date("Y-m-d",strtotime($curMonth."-1 Sunday"));
}
$lastDate=date("Y-m-t",strtotime($curMonth));
if(date('N', strtotime($lastDate)) != 6){
    $lastDate=date("Y-m-d",strtotime($lastDate."+1 Saturday"));
}
$loc="KDT";
$allDates=array();
$greenDates=array();
$redDates=array();
$montHolidays=array();
#endregion

#region main
$monthHQ="SELECT fldDate,fldHoliday FROM kdtholiday WHERE (fldLocation='$loc' AND fldHolidayType != 2) AND fldDate>='$startDate' AND fldDate<='$lastDate'";
$monthHStmt=$connkdt->query($monthHQ);
if($monthHStmt->rowCount()>0){
    $monthHArr=$monthHStmt->fetchAll();
    foreach($monthHArr AS $monthHS){
        $holidate=$monthHS['fldDate'];
        $holiname=$monthHS['fldHoliday'];
        array_push($montHolidays,"$holidate||$holiname");
    }
}
$greenQ="SELECT fldDate FROM dailyreport WHERE fldDate>='$startDate' AND fldDate<='$lastDate' AND fldEmployeeNum='$empNum' GROUP BY fldDate HAVING(SUM(fldDuration))>=480";
$greenStmt=$connwebjmr->query($greenQ);
$greenArr=$greenStmt->fetchAll();
foreach($greenArr AS $greens){
    $greenDate=$greens['fldDate'];
    array_push($greenDates,$greenDate);
}
if($curMonth>=$curFirstDay){
    $lastDate=$curDay;
}
while($startDate<=$lastDate){
    if(isWorkday($startDate) && $startDate>=$dateOrigin){
        if(!in_array($startDate,$greenDates)){
            array_push($redDates,$startDate);
        }
    }
    $startDate=date("Y-m-d",strtotime($startDate."+1 day"));
}

$allDates=[$greenDates,$redDates];
#endregion

#region function
function isWorkDay($selDate){
    GLOBAL $connkdt;
    $isWorkday=TRUE;
    if(date('N', strtotime($selDate)) >= 6){
        $isWorkday=FALSE;
    }
    $workDayQ="SELECT fldHolidayType FROM kdtholiday WHERE fldDate=:selDate";
    $workDayStmt=$connkdt->prepare($workDayQ);
    $workDayStmt->execute([":selDate"=>$selDate]);
    $workDayType=$workDayStmt->fetchColumn();
    if($workDayStmt->rowCount()>0){
        if($workDayType!="2"){
            $isWorkday=FALSE;
        }
        else{
            $isWorkday=TRUE;
        }
    }
    return $isWorkday;
}
#endregion
//$.ajaxSetup({async: false});
echo json_encode($allDates);
?>