<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$getPlanner=NULL;
if(!empty($_POST['getPlanner'])){
    $getPlanner=$_POST['getPlanner'];
}
$planned=array();
#endregion

#region main
$plansQ="SELECT pl.*,dr.fldJob AS projJob,pt.fldProject AS projName,it.fldItem AS projItem,pt.fldGroup AS projGroup FROM planning AS pl JOIN drawingreference AS dr ON pl.fldJob=dr.fldID JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN itemofworkstable AS it ON dr.fldItem=it.fldID WHERE pl.fldPlanner=:getPlanner ORDER BY pl.fldStartDate DESC";
$plansStmt=$connwebjmr->prepare($plansQ);
$plansStmt->execute([":getPlanner"=>$getPlanner]);
if($plansStmt->rowCount()>0){
    $planArr=$plansStmt->fetchAll();
    foreach($planArr AS $plan){
        $planID=$plan['fldID'];
        $projGroup=$plan['projGroup'];
        $projName=$plan['projName'];
        $projItem=$plan['projItem'];
        $projJob=$plan['projJob'];
        $projEmp=$plan['fldEmployeeNum'];
        $projEmpName=getEmpName($projEmp);
        $projStart=date("M d, Y",strtotime($plan['fldStartDate']));
        $projEnd=date("M d, Y",strtotime($plan['fldEndDate']));
        $projMH=($plan['fldHours'])/60;
        $projStatus=$plan['fldStatus'];
        if($projStatus!=NULL){
            $projStatus=date("M d, Y",strtotime($projStatus));
        }
        array_push($planned,"$planID||$projGroup||$projName||$projItem||$projJob||$projEmpName||$projStart||$projEnd||$projMH||$projStatus");
    }
}
#endregion

#region function
function getEmpName($employeeNumber){
GLOBAL $connkdt;
$ename=NULL;
$nameQ="SELECT CONCAT(fldSurname,', ',fldFirstname) AS ename FROM emp_prof WHERE fldEmployeeNum=:employeeNumber";
$nameStmt=$connkdt->prepare($nameQ);
$nameStmt->execute([":employeeNumber"=>$employeeNumber]);
if($nameStmt->rowCount()>0){
    $ename=$nameStmt->fetchColumn();
}
return $ename;
}
#endregion
echo json_encode($planned);
?>