<?php
#region Require Database Connections
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$planID=NULL;
if(!empty($_POST['planID'])){
    $planID=$_POST['planID'];
}
$planDetails=array();
#endregion

#region main
$plansQ="SELECT pl.*,dr.fldProject AS projID,dr.fldItem AS itemID,pt.fldGroup AS projGroup FROM planning AS pl JOIN drawingreference AS dr ON pl.fldJob=dr.fldID JOIN projectstable AS pt ON dr.fldProject=pt.fldID WHERE pl.fldID=:planID ORDER BY pl.fldStartDate DESC";
$plansStmt=$connwebjmr->prepare($plansQ);
$plansStmt->execute([":planID"=>$planID]);
if($plansStmt->rowCount()>0){
    $planArr=$plansStmt->fetchAll();
    foreach($planArr AS $plan){
        $projGroup=$plan['projGroup'];
        $projID=$plan['projID'];
        $itemID=$plan['itemID'];
        $jobID=$plan['fldJob'];
        $projEmp=$plan['fldEmployeeNum'];
        $projStart=$plan['fldStartDate'];
        $projEnd=$plan['fldEndDate'];
        $projMH=($plan['fldHours'])/60;
        $planner=$plan['fldPlanner'];

        array_push($planDetails,"$projGroup||$projID||$itemID||$jobID||$projEmp||$projStart||$projEnd||$projMH||$planner");
    }
}
#endregion

#region function

#endregion
echo json_encode($planDetails);
?>