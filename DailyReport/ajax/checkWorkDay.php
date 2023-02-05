<?php
#region Database Connection
require_once "../Includes/dbconnectkdtph.php";
#endregion
#region Initialize Variable
$isWorkday=TRUE;
$selDate=date("Y-m-d");
if(isset($_REQUEST['selDate'])){
    $selDate=$_REQUEST['selDate'];
}
if(date('N', strtotime($selDate)) >= 6){
    $isWorkday=FALSE;
}
#endregion
#region WorkDay Query
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
echo json_encode($isWorkday);
#endregion
?>