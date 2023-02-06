<?php 
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion

$updateq="UPDATE `$dbCol` SET fldPriority=:newPrio WHERE fldID=:trID";
$updatestmt=$connwebjmr->prepare($updateq);

$nmbr='1';
$prioq="SELECT fldID FROM `$dbCol` WHERE fldActive=1 AND fldDelete=0 $statement ORDER BY fldPriority ASC";
$priostmt=$connwebjmr->query($prioq);
if($priostmt->rowCount()>0){
    while($rowprio=$priostmt->fetch()){
        $newPrio=$nmbr;
        $trID=$rowprio['fldID'];
        $updatestmt->execute([":newPrio"=>$newPrio,":trID"=>$trID]);
        $nmbr++;
    }
}
?>

