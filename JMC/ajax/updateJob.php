<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$clmn='';
if(isset($_REQUEST['clmn'])){
    $clmn=$_REQUEST['clmn'];
    switch ($clmn){
        case "clTitle":
            $clmn='fldJob';
            break;
        case "cltrNoSheet":
            $clmn='fldNoSheets';
            break;
        case "cltrPaperSize":
            $clmn='fldPaperSize';
            break;
        case "cltrKHIDate":
            $clmn='fldKHIDate';
            break;
        case "cltrKHIC":
            $clmn='fldKHIC';
            break;
        case "cltrKHIDeadline":
            $clmn='fldKHIDeadline';
            break;
        case "cltrKDTDeadline":
            $clmn='fldKDTDeadline';
            break;
        case "cltrExpMH":
            $clmn='fldExpectedMH';
            break;
    }
}
$val='';
if(isset($_REQUEST['val'])){
    $val=$_REQUEST['val'];
}
$id='';
if(isset($_REQUEST['id'])){
    $id=$_REQUEST['id'];
}
#endregion
#region Update Query
$updateQ="UPDATE drawingreference SET `$clmn`=:val WHERE fldID=:id";
$updateStmt=$connwebjmr->prepare($updateQ);
$updateStmt->execute([":val"=>$val,":id"=>$id]);
#endregion
var_dump($updateStmt);
?>