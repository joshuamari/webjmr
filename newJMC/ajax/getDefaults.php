<?php
#region Database Connection
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$defaults=array();
#endregion
#region Defaults Query
$defaultsQ="SELECT * FROM projectstable WHERE fldDirect=0";
$defaultsStmt=$connwebjmr->query($defaultsQ);
$defArr=$defaultsStmt->fetchAll();
foreach($defArr AS $dflts){
    array_push($defaults,$dflts['fldProject']."||p_".$dflts['fldID']);
}
echo json_encode($defaults);
#endregion
?>