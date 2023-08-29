<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once '../Includes/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$groupSel = array();
$groupStatement = "";
if (!empty($_POST['groupSel'])) {
    $groupSel = $_POST['groupSel'];
    $implodeString = implode("','", $groupSel);
    $groupStatement = "AND pt.fldGroup IN ('" . $implodeString . "')";
}
$yearMonth = date("Y-m");
if (!empty($_POST['monthSel'])) {
    $yearMonth = $_POST['monthSel'];
}
$entriesArray = array();
$otherTow = ["Trng", "Mtng"];
$ogp = '';
if (!empty($_POST['ogpSel'])) {
    if (filter_var($_POST['ogpSel'], FILTER_VALIDATE_BOOLEAN)) {
        $ogp = " AND pt.fldGroup=dr.fldGroup";
    }
}
#endregion

#region main
$entriesQuery = "SELECT pt.fldGroup,dr.fldEmployeeNum,SUM(dr.fldDuration) AS totalHrs,tw.fldCode FROM `dailyreport` AS dr JOIN projectstable AS pt ON dr.fldProject=pt.fldID JOIN typesofworktable AS tw ON dr.fldTOW=tw.fldID WHERE dr.fld2D3D IS NOT NULL $groupStatement AND dr.fldDate LIKE :monthSel $ogp GROUP BY dr.fldGroup,dr.fldEmployeeNum,dr.fldTOW ORDER BY CASE WHEN pt.fldGroup = 'ANA' THEN 3 WHEN pt.fldGroup = 'MPM' THEN 2 WHEN pt.fldGroup = 'ETCL' THEN 1 ELSE 0 END, pt.fldGroup, dr.fldEmployeeNum";
$entriesStmt = $connwebjmr->prepare($entriesQuery);
$entriesStmt->execute([":monthSel" => "$yearMonth%"]);
$entriesArr = $entriesStmt->fetchAll();

foreach ($entriesArr as $ent) {
    $group = $ent['fldGroup'];
    $emp = getName($ent['fldEmployeeNum']);
    $hrs = $ent['totalHrs'] / 60;
    $tow = in_array($ent['fldCode'], $otherTow) ? "Other" : $ent['fldCode'];
    $entriesArray[$group][$emp][$tow] = $hrs;
}
#endregion

#region function
function getName($empNum)
{
    global $connkdt;
    $eName = '';
    $nameQ = "SELECT CONCAT(fldSurname,', ',fldFirstname) AS ename FROM emp_prof WHERE fldEmployeeNum = :empNum";
    $nameStmt = $connkdt->prepare($nameQ);
    $nameStmt->execute([":empNum" => $empNum]);
    $eName = $nameStmt->fetchColumn();
    return $eName;
}
#endregion

echo json_encode($entriesArray, JSON_PRETTY_PRINT);
