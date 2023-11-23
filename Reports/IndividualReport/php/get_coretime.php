<?php
#region DB Connect
require_once '../dbconn/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$selLoc = 1;
$locDefaults = [0, 1, 2];
if (isset($_POST['selLoc'])) {
    if (!empty(json_decode($_POST['selLoc'])) && !in_array(json_decode($_POST['selLoc']), $locDefaults)) {
        $selLoc = json_decode($_POST['selLoc']);
    }
}

$ymSel = date("Y-m-01");
if (!empty($_POST['ymSel'])) {
    $ymSel = date("Y-m-01", strtotime($_POST['ymSel']));
}
$coretime = [];

$coretimeMahalaga = ["Time", "Halfday", "Lunch", "Dinner"];
$coreStmt = " AND cn.core_name IN ('" . implode("', '", $coretimeMahalaga) . "')";

$coreQ = "SElECT cn.core_name,ct.core_start,ct.core_time FROM `coretime` AS ct JOIN `coretime_name` AS cn ON ct.core_name_id=cn.core_name_id WHERE ct.location_id=:selLoc AND ct.effective_date = (SELECT MAX(effective_date) FROM coretime WHERE :ymSel >= effective_date AND location_id=:selLoc) $coreStmt";
$coreStmt = $connwebjmr->prepare($coreQ);
#endregion

#region main query
try {
    $coreStmt->execute([":selLoc" => $selLoc, ":ymSel" => $ymSel]);
    $coreArr = $coreStmt->fetchAll();
    if (empty($coreArr)) {
        $coreStmt->execute([":selLoc" => 1, ":ymSel" => $ymSel]);
        $coreArr = $coreStmt->fetchAll();
    }
    foreach ($coreArr as $core) {
        $name = $core['core_name'];
        $start = (int)$core['core_start'];
        $time = date("H:i", strtotime($core['core_time']));
        if ($start == 0) {
            $coretime[$name]['end'] = $time;
        } else {
            $coretime[$name]['start'] = $time;
        }
    }
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}

#endregion
#region FUNCTIONS
#endregion
echo json_encode($coretime);
