<?php
#region Database Connection
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$defaults = array();
#endregion
#region Defaults Query
$defaultsQ = "SELECT * FROM projectstable WHERE fldDirect=0 AND fldDelete=0";
$defaultsStmt = $connwebjmr->query($defaultsQ);
$defArr = $defaultsStmt->fetchAll();
foreach ($defArr as $dflts) {
    array_push($defaults, (int)$dflts['fldID']);
}
echo json_encode($defaults);
#endregion
