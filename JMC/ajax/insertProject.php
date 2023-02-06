<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$projName='';
if(isset($_REQUEST['projName'])){
    $projName=$_REQUEST['projName'];
}
$grp='';
if(isset($_REQUEST['grp'])){
    $grp=$_REQUEST['grp'];
}
$prioq="SELECT MAX(fldPriority) FROM projectstable WHERE fldActive='1' AND fldGroup='$grp'";
$priostmt=$connwebjmr->query($prioq);
$maxPrio=$priostmt->fetchColumn();
$maxPrio++;
#endregion

#region Insert Query
$projQ="INSERT INTO projectstable(fldProject,fldGroup,fldPriority) VALUES (:projName,:grp,:maxPrio)";
$projStmt=$connwebjmr->prepare($projQ);
$projStmt->execute([":projName"=>$projName,":grp"=>$grp,":maxPrio"=>$maxPrio]);
#endregion
echo "wat"
?>