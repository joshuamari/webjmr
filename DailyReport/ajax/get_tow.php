<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "./global_var.php";
#endregion
#region Initialize Variable
$output="<option value='' selected hidden>Select...</option>";
$projID='';
if(isset($_REQUEST['projID'])){
    $projID=$_REQUEST['projID'];
}
$type=1;
if($projID==$leaveID){
    $type=0;
}
#endregion
#region MyGroup Query
$itemQ="SELECT * FROM typesofworktable WHERE fldTOWType=:type AND fldActive=1 ORDER BY fldPrio";
$itemStmt=$connwebjmr->prepare($itemQ);
$itemStmt->execute([":type"=>$type]);
$itemArr=$itemStmt->fetchAll();
foreach($itemArr AS $item){
    $itemName=$item['fldTOW'];
    $itemCode=$item['fldCode'];
    $itemID=$item['fldID'];
    $output.="<option tow-id='$itemID'>$itemCode - $itemName</option>";
}
#endregion
echo $output;
?>