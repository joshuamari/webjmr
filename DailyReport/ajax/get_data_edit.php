<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$primaryID='';
if(isset($_REQUEST['primaryID'])){
    $primaryID=$_REQUEST['primaryID'];
}
$dataEdit=array();
// [location,group,project-ID,item-ID,JRDesc,duration,MHType,tow,remarks,twothree,rev,checker]
#endregion
#region Entries Query
$drQ="SELECT * FROM dailyreport WHERE fldID='$primaryID'";
$drStmt=$connwebjmr->query($drQ);
$drArr=$drStmt->fetchAll();
foreach($drArr AS $drs){
    $loc=$drs['fldLocation'];
    $grp=$drs['fldGroup'];
    $projID=$drs['fldProject'];
    $itemID=$drs['fldItem'];
    $jobID=$drs['fldJobRequestDescription'];
    $duration=$drs['fldDuration'];
    $mhType=$drs['fldMHType'];
    $tow=$drs['fldTOW'];
    $rmrks=$drs['fldRemarks'];
    $twothree=$drs['fld2D3D'];
    $rev=$drs['fldRevision'];
    $checker=$drs['fldChecker'];
    $getTrGrp=$drs['fldTrGroup'];
    $grpID=$drs['fldGroupID'];
    array_push($dataEdit,$loc);
    array_push($dataEdit,$grp);
    array_push($dataEdit,$projID);
    array_push($dataEdit,$itemID);
    array_push($dataEdit,$jobID);
    array_push($dataEdit,$duration);
    array_push($dataEdit,$mhType);
    array_push($dataEdit,$tow);
    array_push($dataEdit,$rmrks);
    array_push($dataEdit,$twothree);
    array_push($dataEdit,$rev);
    array_push($dataEdit,$checker);
    array_push($dataEdit,$getTrGrp);
    array_push($dataEdit,$grpID);
}
#endregion
echo json_encode($dataEdit);
?>