<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
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
$updateQ="UPDATE itemofworkstable SET fldItem=:val WHERE fldID=:id";
$updateStmt=$connwebjmr->prepare($updateQ);
$updateStmt->execute([":val"=>$val,":id"=>$id]);
#endregion
var_dump($updateStmt);
?>