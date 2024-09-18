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
  $insertDRQ = "SELECT `dr`.`fldID` AS `id`,
	   `dl`.`fldLocation` AS `location`,
     `dr`.`fldGroup` AS `group`,
     `pt`.`fldProject` AS `projName`,
     `it`.`fldItem` AS `itemName`,
     `jt`.`fldJob` AS `jobName`,
     `dr`.`fldDuration` AS `duration`,
     `dr`.`fldMHType` AS `MHType`,
     `dr`.`fldRemarks` AS `remarks`,
     `pt`.`fldDelete` AS `projDel`,
     `tow`.`fldTOW` AS `towName`
    FROM dailyreport AS dr 
    LEFT OUTER JOIN projectstable AS pt 
    ON dr.fldProject = pt.fldID 
    LEFT OUTER JOIN itemofworkstable AS it 
    ON dr.fldItem = it.fldID 
    LEFT OUTER JOIN drawingreference AS jt 
    ON dr.fldJobRequestDescription = jt.fldID 
    LEFT OUTER JOIN dispatch_locations AS dl 
    ON dr.fldLocation = dl.fldID 
    LEFT OUTER JOIN typesofworktable AS tow 
    ON dr.fldTOW = tow.fldID 
    WHERE dr.fldDate = :selDate AND dr.fldEmployeeNum = :empNum";
  $fetchDRStmt = $connwebjmr->prepare($insertDRQ);
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