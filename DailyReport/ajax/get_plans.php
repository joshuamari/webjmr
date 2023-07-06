<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$getEmployee=NULL;
if(!empty($_POST['getEmployee'])){
    $getEmployee=$_POST['getEmployee'];
}
$planned=array();
#endregion

#region main
$plansQ="SELECT pl.*,dr.fldID AS projJobID, dr.fldJob AS projJob,pt.fldProject AS projName FROM planning AS pl JOIN drawingreference AS dr ON pl.fldJob=dr.fldID JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN itemofworkstable AS it ON dr.fldItem=it.fldID WHERE pl.fldEmployeeNum=:getEmployee ORDER BY pl.fldStartDate DESC";
$plansStmt=$connwebjmr->prepare($plansQ);
$plansStmt->execute([":getEmployee"=>$getEmployee]);
if($plansStmt->rowCount()>0){
    $planArr=$plansStmt->fetchAll();
    foreach($planArr AS $plan){
        $output = array();
        $planID=$plan['fldID'];
        $projName=$plan['projName'];
        $projJob=$plan['projJob'];
        $projJobID=$plan['projJobID'];
        $projEnd=date("M d, Y",strtotime($plan['fldEndDate']));
        $projMH=($plan['fldHours'])/60;
        $usedHours=getUsedHours($projJobID,$getEmployee,$plan['fldStartDate'],$plan['fldEndDate']);
        $projStatus=$plan['fldStatus'];
        if($projStatus!=NULL){
            $projStatus=date("M d, Y",strtotime($projStatus));
        }
        $output += ["planID" => $planID];
        $output += ["projName" => $projName];
        $output += ["projJob" => $projJob];
        $output += ["projEnd" => $projEnd];
        $output += ["projMH" => $projMH];
        $output += ["usedHours" => $usedHours];
        $output += ["projStatus" => $projStatus];
        array_push($planned, $output);
        // array_push($planned,"$planID||$projName||$projJob||$projEnd||$projMH||$usedHours||$projStatus");
    }
}
#endregion

#region function
function getUsedHours($jobID,$employeeNumber,$dateStart,$dateEnd){
GLOBAL $connwebjmr;
$projHours=0;
$hoursQ="SELECT SUM(fldDuration) FROM dailyreport WHERE fldEmployeeNum=:employeeNumber AND fldJobRequestDescription=:jobID AND fldDate BETWEEN :dateStart AND :dateEnd";
$hoursStmt=$connwebjmr->prepare($hoursQ);
$hoursStmt->execute([":employeeNumber"=>$employeeNumber,":jobID"=>$jobID,":dateStart"=>$dateStart,":dateEnd"=>$dateEnd]);
$rawHours=$hoursStmt->fetchColumn();
$projHours=$rawHours/60;
return $projHours;
}
#endregion
echo json_encode($planned);
?>