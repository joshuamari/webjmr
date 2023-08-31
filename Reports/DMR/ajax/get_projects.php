<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$groupSel = NULL;
if (!empty($_POST['groupSel'])) {
    $groupSel = $_POST['groupSel'];
}
$projSel = NULL;
if (!empty($_POST['projSel'])) {
    $projSel = $_POST['projSel'];
    $projStatement = "AND dr.fldProject ='$projSel'";
}

$projArray = array();

#endregion

#region main
$projQuery = "SELECT * FROM projectstable WHERE fldGroup = :groupSel AND fldDelete=0 ORDER BY fldProject";
$projStmt = $connwebjmr->prepare($projQuery);
$projStmt->execute([":groupSel" => $groupSel]);
$projArr = $projStmt->fetchAll();
foreach ($projArr as $proj) {
    $output = array();
    $projID = $proj['fldID'];
    $projName = $proj['fldProject'];
    $output += ["projID" => $projID];
    $output += ["projName" => $projName];
    array_push($projArray, $output);
}
#endregion

#region function


#endregion
echo json_encode($projArray, JSON_PRETTY_PRINT);
