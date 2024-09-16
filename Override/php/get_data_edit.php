<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion

#region Initialize Variable
if(!empty($_POST['drID'])) {
  $drID = $_POST['drID'];
} else {
  $result['isSuccess'] = false;
  $result['message'] = 'No Daily Report ID submitted!';
  die(json_encode($result));
}
#endregion

#region Main Query
try {
  $getDataDRQ = "SELECT `fldID` AS `id`,
                        `fldLocation` AS `locID`,
                        `fldProject` AS `projID`,
                        `fldItem` AS `itemID`,
                        `fldJobRequestDescription` AS `jobReqDesc`,
                        `fld2D3D` AS `twoDthreeD`,
                        `fldRevision` AS `revision`,
                        `fldTOW` AS `TOW`,
                        `fldChecker` AS `checkerID`,
                        `fldDuration` AS `duration`,
                        `fldMHType` AS `MHType`,
                        `fldRemarks` AS `remarks`,
                        `fldTrGroup` AS `trGrp`
                 FROM dailyreport
                 WHERE `fldID` = :drID";
  $getDataDRStmt = $connwebjmr->prepare($getDataDRQ);
  $getDataDRStmt->execute([":drID" => $drID]);
  if($getDataDRStmt->rowCount() > 0) {
    $result['result'] = $getDataDRStmt->fetchAll();
    $result['isSuccess'] = true;
    $result['message'] = "Data Retrieved Successfully!";
  }
  else {
    $result['isSuccess'] = false;
    $result['message'] = "Failed to retrieve data";
  }
} catch (Exception $e) {
  $result["isSuccess"] = false;
  $result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);

