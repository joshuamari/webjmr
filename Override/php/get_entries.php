<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion

#region Initialize Variable
if(!empty($_POST['empNum'])) {
  $empNum = $_POST['empNum'];
} else{
  $result['isSuccess'] = FALSE;
  $result['message'] = "No Employee Number submited!";
  die(json_encode($result));
}
$selDate = (!empty($_POST['selDate'])) ? $_POST['selDate'] : date("Y-m-d");
#endregion

#region Main Query
try{
  $getDRQ = "SELECT `dr`.`fldID` AS `id`,
     `dr`.`fldLocation` AS `locID`,
	   `dl`.`fldLocation` AS `location`,
     `dr`.`fldGroupID` as `groupID`,
     `dr`.`fldGroup` AS `group`,
     `dr`.`fldProject` AS `projID`,
     `pt`.`fldProject` AS `projName`,
     `dr`.`fldItem` AS `itemID`,
     `it`.`fldItem` AS `itemName`,
     `dr`.`fldJobRequestDescription` AS `jobReqDesc`,
     `jt`.`fldJob` AS `jobName`,
     `dr`.`fld2D3D` AS `twoDthreeD`,
     `dr`.`fldRevision` AS `revision`,
     `dr`.`fldTOW` AS `TOW`,
     `dr`.`fldChecker` AS `checkerID`,
     `dr`.`fldDuration` AS `duration`,
     `dr`.`fldMHType` AS `MHType`,
     `dr`.`fldRemarks` AS `remarks`,
     `dr`.`fldTrGroup` AS `trGrp`,
     `pt`.`fldDelete` AS `projDel`,
     `tow`.`fldTOW` AS `towName` 
    FROM dailyreport AS dr 
    LEFT OUTER JOIN projectstable AS `pt` 
    ON `dr`.`fldProject` = `pt`.`fldID` 
    LEFT OUTER JOIN itemofworkstable AS `it` 
    ON `dr`.`fldItem` = `it`.`fldID` 
    LEFT OUTER JOIN drawingreference AS `jt` 
    ON `dr`.`fldJobRequestDescription` = `jt`.`fldID` 
    LEFT OUTER JOIN dispatch_locations AS dl 
    ON `dr`.`fldLocation` = `dl`.`fldID` 
    LEFT OUTER JOIN typesofworktable AS `tow` 
    ON `dr`.`fldTOW` = `tow`.`fldID` 
    WHERE `dr`.`fldDate` = :selDate AND `dr`.`fldEmployeeNum` = :empNum";
  $fetchDRStmt = $connwebjmr->prepare($getDRQ);
  $fetchDRStmt->execute([
    ":selDate" => $selDate,
    ":empNum" => $empNum,
  ]);
  if($fetchDRStmt->rowCount() > 0) {
    $result['result'] = $fetchDRStmt->fetchAll();
    $result['isSuccess'] = TRUE;
    $result['message'] = 'Successfully Retrieved!';
  } else{
    $result['isSuccess'] = FALSE;
    $result['message'] = 'No Data Available';
  }
} catch (Exception $e) {
	$result["isSuccess"] = FALSE;
	$result['message'] =  "Connection failed: " . $e->getMessage();
}

echo json_encode($result);