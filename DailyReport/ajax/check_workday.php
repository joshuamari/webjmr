<?php
#region Database Connection
require_once "../../dbconn/dbconnectkdtph.php";
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
$selLoc="KDT";
if(!empty($_REQUEST['selLoc'])){
    $selLoc=$_REQUEST['selLoc'];
}
#endregion
#region WorkDay Query
$workDayQ="SELECT fldHolidayType FROM kdtholiday WHERE fldDate=:selDate AND fldLocation=:selLoc";
$workDayStmt=$connkdt->prepare($workDayQ);
$workDayStmt->execute([":selDate"=>$selDate,":selLoc"=>$selLoc]);
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