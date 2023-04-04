<?php
#region Database Connection
require_once "../Includes/dbconnectwebjmr.php";
require_once "../Includes/dbconnectkdtph.php";
#endregion
#region Initialize Variable
$output=array();
$statement='';
$kdtSearch='';
$kdtGroup='';

$search='';
if(!empty($_POST['search'])){
    $search=$_POST['search'];
    $kdtSearch=" AND fldName LIKE '%$search%'";
}
$empGroup='';
if(!empty($_POST['empGroup'])){
    $empGroup=$_POST['empGroup'];
    $kdtGroup=" AND fldGroup = '$empGroup'";
}

$memList='(';
$memQ="SELECT * FROM emp_prof WHERE fldActive=1 AND fldNick<>'' $kdtGroup $kdtSearch";
$memStmt=$connkdt->query($memQ);
if($memStmt->rowCount()>0){
    $memArr=$memStmt->fetchAll();
    foreach($memArr AS $mems){
        $mem=$mems['fldEmployeeNum'];
        $memList.="'$mem',";
    }
    $memList=rtrim($memList,',');
    $memList.=")";
    $statement=" AND fldEmployeeNum IN $memList";
}
else{
    exit("<tr><td colspan='13'>No entries</td></tr>");
}
$ymSel=date("Y-m");
if(!empty($_POST['ymSel'])){
    $ymSel=$_POST['ymSel'];
}
#endregion

#region Defaults Query
$defaultsQ="SELECT * FROM dailyreport WHERE fldDate LIKE '%$ymSel%' $statement ORDER BY fldEmployeeNum,fldDate";
$defaultsStmt=$connwebjmr->query($defaultsQ);
$defArr=$defaultsStmt->fetchAll();
if($defaultsStmt->rowCount()>0){
    foreach($defArr AS $dflts){
        $enum=$dflts['fldEmployeeNum'];
        $egrp=$dflts['fldGroup'];
        $edate=$dflts['fldDate'];
        $eloc=$dflts['fldLocation'];
        $locQ="SELECT fldLocation FROM dispatch_locations WHERE fldID='$eloc'";
        $locStmt=$connwebjmr->query($locQ);
        $locName=$locStmt->fetchColumn();
        $eproject=$dflts['fldProject'];
        $projQ="SELECT fldProject,fldGroup FROM projectstable WHERE fldID='$eproject'";
        $projStmt=$connwebjmr->query($projQ);
        $projArr=$projStmt->fetchAll();
        foreach($projArr AS $prj){
            $projName=$prj['fldProject'];
            $projGroup=$prj['fldGroup'];
        }
        $grpShare="";
        if($projGroup!=NULL && $projGroup!=$egrp){
            $grpShare="($projGroup)";
        }
        $eproj=$projName.$grpShare;
        $eitem=$dflts['fldItem'];
        $itemQ="SELECT fldItem FROM itemofworkstable WHERE fldID='$eitem'";
        $itemStmt=$connwebjmr->query($itemQ);
        $eitm=$itemStmt->fetchColumn();
        $ejab=$dflts['fldJobRequestDescription'];
        $jobQ="SELECT fldJob FROM drawingreference WHERE fldID='$ejab'";
        $jobStmt=$connwebjmr->query($jobQ);
        $ejob=$jobStmt->fetchColumn();
        $e2d=$dflts['fld2D3D'];
        $erev=$dflts['fldRevision'];
        $etows=$dflts['fldTOW'];
        $towQ="SELECT fldTOW FROM typesofworktable WHERE fldID='$etows'";
        $towStmt=$connwebjmr->query($towQ);
        $etow=$towStmt->fetchColumn();
        $edur=$dflts['fldDuration']/60;
        $emanh=$dflts['fldMHType'];
        switch($emanh){
            case "0":
                $emh="Regular";
                break;
            case "1";
                $emh="OT";
                break;
            case "2":
                $emh="Leave";
                break;
        }
        $nameQ="SELECT CONCAT(fldSurname,', ',fldFirstname) AS ename FROM emp_prof WHERE fldEmployeeNum='$enum'";
        $nameStmt=$connkdt->query($nameQ);
        $ename=$nameStmt->fetchColumn();
        array_push($output,"$ename||$egrp||$edate||$locName||$eproj||$eitm||$ejob||$e2d||$erev||$etow||$edur||$emh");
    }
}
#endregion
echo json_encode($output);
?>