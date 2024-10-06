<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$entries=array();
$curDay=date("Y-m-d");
if(isset($_REQUEST['curDay'])){
    $curDay=$_REQUEST['curDay'];
}
$empNum='';
if(isset($_REQUEST['empNum'])){
    $empNum=$_REQUEST['empNum'];
}
#endregion
#region Entries Query
$drQ="SELECT dr.* ,pt.fldProject AS projName,it.fldItem AS itemName,jt.fldJob AS jobName,dl.fldLocation AS locName,pt.fldDelete AS projDel, tow.fldTOW AS towName FROM dailyreport AS dr LEFT OUTER JOIN projectstable AS pt ON dr.fldProject=pt.fldID LEFT OUTER JOIN itemofworkstable AS it ON dr.fldItem=it.fldID LEFT OUTER JOIN drawingreference AS jt ON dr.fldJobRequestDescription=jt.fldID LEFT OUTER JOIN dispatch_locations AS dl ON dr.fldLocation=dl.fldID LEFT OUTER JOIN typesofworktable AS tow ON dr.fldTOW = tow.fldID WHERE dr.fldDate='$curDay' AND dr.fldEmployeeNum='$empNum'";
$drStmt=$connwebjmr->query($drQ);
$drArr=$drStmt->fetchAll();
foreach($drArr AS $dr){
    //["primary_id||location||group||project||item||description||hour||mht"]
    $drID=$dr['fldID'];
    $drLoc=$dr['locName'];
    $drGroup=$dr['fldGroup'];
    $drProj=$dr['projName'];
    $drItem=$dr['itemName'];
    $drJob=$dr['jobName'];
    $drHour=$dr['fldDuration'];
    $drMH=$dr['fldMHType'];
    $drRemarks=$dr['fldRemarks'];
    $projDel=$dr['projDel'];
    $towName = empty($dr['towName']) ? "-" : $dr['towName'];
    $drEntry=$drID."||".$drLoc."||".$drGroup."||".$drProj."||".$drItem."||".$drJob."||".$drHour."||".$drMH."||".$drRemarks."||".$projDel."||".$towName;
    array_push($entries,$drEntry);
}
#endregion
echo json_encode($entries);
?>