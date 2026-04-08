<?php
require_once '../../../dbconn/dbconnectkdtph.php';
$yearMonth = date("Y-m");
$location = 1;
$locKDT = [-1,0,2];
if(!empty($_POST['monthSel'])){
    $yearMonth = $_POST['monthSel'];
}
if(!empty($_POST['location'])){
    $location = $_POST['location'];
}
if(in_array($location,$locKDT)){
    $location = 1;
}
$holidays=[];
$holidayQ = "SELECT fldDate FROM `kdtholiday` WHERE fldDate LIKE :yearMonth ORDER BY fldDate";
$holidayStmt = $connkdt->prepare(($holidayQ));
$holidayStmt->execute([":yearMonth"=>"%$yearMonth%"]);
$holidayArr = $holidayStmt->fetchAll();
foreach($holidayArr AS $holiday){
    $holidays[] = $holiday['fldDate'];
}

echo json_encode($holidays);