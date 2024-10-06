<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion
#region Initialize Variable
$output='<option value="" hidden selected>Select Location</option>';
#endregion
#region MyGroup Query
$disLocQ="SELECT * FROM dispatch_locations WHERE fldActive=1";
$disLocStmt=$connwebjmr->query($disLocQ);
$disArr=$disLocStmt->fetchAll();
foreach($disArr AS $locs){
    $locid=$locs['fldID'];
    $locName=$locs['fldLocation'];
    $output.="<option loc-id='$locid'>$locName</option>";
}
#endregion
echo $output;
?>