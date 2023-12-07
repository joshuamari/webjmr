<?php
#region DB Connect
require_once '../dbconn/dbconnectwebjmr.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$locations = [];
$extraLocation = ["name" => "KDT/WFH", "id" => 0];


#endregion

#region main query
try {
    $locQ = "SELECT * FROM dispatch_locations WHERE fldActive=1";
    $locStmt = $connwebjmr->query($locQ);
    if ($locStmt->rowCount() > 0) {
        $locArr = $locStmt->fetchAll();
        foreach ($locArr as $loc) {
            $output = array();
            $id = (int)$loc['fldID'];
            $name = $loc['fldLocation'];
            $output += ["name" => $name];
            $output += ["id" => $id];
            array_push($locations, $output);
            if ($name == "WFH") {
                $locations[] = $extraLocation;
            }
        }
    }
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
}

#endregion
#region FUNCTIONS
#endregion
echo json_encode($locations);
