<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$projID='';
if(isset($_REQUEST['projID'])){
    $projID=$_REQUEST['projID'];
}
$empNum='';
if(isset($_REQUEST['empNum'])){
    $empNum=$_REQUEST['empNum'];
}

#endregion

#region Insert Query
$projQ="DELETE FROM project_share WHERE fldProject=:projID AND fldEmployeeNum=:empNum";
$projStmt=$connwebjmr->prepare($projQ);
$projStmt->execute([":projID"=>$projID,":empNum"=>$empNum]);
#endregion
?>