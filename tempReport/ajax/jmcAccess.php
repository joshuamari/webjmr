<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$empNum='';
if(!empty($_POST['empNum'])){
    $empNum=$_POST['empNum'];
}
#endregion

#region main query
$accessQ="SELECT fldJMCImport FROM kdtoptions WHERE fldEmployeeNumber='$empNum'";
$accessStmt=$connkdt->query($accessQ);
$access=$accessStmt->fetchColumn();
#endregion

#region function

#endregion

echo $access;
?>