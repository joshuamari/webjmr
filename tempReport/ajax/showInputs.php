<?php
#region Database Connection
require_once "../Includes/dbconnectwebjmr.php";
require_once "../Includes/dbconnectkdtph.php";
#endregion
#region Initialize Variable
$output='';
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
$count="1";
if($defaultsStmt->rowCount()>0){
    foreach($defArr AS $dflts){
        $enum=$dflts['fldEmployeeNum'];
        $egrp=$dflts['fldGroup'];
        $edate=$dflts['fldDate'];
        $eloc=$dflts['fldLocation'];
        $eproject=$dflts['fldProject'];
        $projQ="SELECT fldProject FROM projectstable WHERE fldID='$eproject'";
        $projStmt=$connwebjmr->query($projQ);
        $eproj=$projStmt->fetchColumn();
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
        $output .= <<<EOD
        <tr>
            <td>$count</td>
            <td>$ename</td>
            <td>$egrp</td>
            <td>$edate</td>
            <td>$eloc</td>
            <td>$eproj</td>
            <td>$eitm</td>
            <td>$ejob</td>
            <td>$e2d</td>
            <td>$erev</td>
            <td>$etow</td>
            <td>$edur</td>
            <td>$emh</td>
        </tr>
        EOD;
        $count++;
    }
}
else{
    $output="<tr><td colspan='13'>No entries</td></tr>";
}
#endregion
echo $output;
?>