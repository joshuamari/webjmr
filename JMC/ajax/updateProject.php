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
            $clmn='fldProject';
            break;
        case "clOrder":
            $clmn='fldOrder';
            break;
        case "clBUIC":
            $clmn='fldBUIC';
            break;
    }
}
$val=NULL;
if(!empty($_REQUEST['val'])){
    $val=$_REQUEST['val'];
}
$id='';
if(isset($_REQUEST['id'])){
    $id=$_REQUEST['id'];
}
#endregion
#region Update Query
$updateQ="UPDATE projectstable SET `$clmn`=:val WHERE fldID=:id";
$updateStmt=$connwebjmr->prepare($updateQ);
$updateStmt->execute([":val"=>$val,":id"=>$id]);
#endregion
var_dump($updateStmt);
?>