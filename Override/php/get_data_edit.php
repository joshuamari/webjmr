<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion
 
#region Initialize Variable
$result = [
  "isSuccess" => FALSE,
  "message" => ''
];
$required_fields = [
  'empNum' => "Employee ID",
  'selDate' => "Selected Date",
];
$input = $_POST;
$missing_fields = [];
#endregion
 
#region input checking region
foreach ($required_fields as $key => $descrpition) {
  if (empty($input[$key])) {
    $missing_fields[] = $descrpition;
  }
}
#endregion
 
#region for separtion of error
$count = count($missing_fields);
if ($count > 0) {
  if ($count === 1) {
    $result['message'] = "{$missing_fields[0]} is missing.";
  } elseif ($count === 2) {
    $result['message'] = "{$missing_fields[0]} and {$missing_fields[1]} are missing.";
  } else {
    $last_field = array_pop($missing_fields);
    $result['message'] = implode(', ', $missing_fields) . ", and $last_field are missing.";
  }
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
                 WHERE `fldEmployeeNum` = :empNum AND `fldDate` = :selDate";
  $getDataDRStmt = $connwebjmr->prepare($getDataDRQ);
  $getDataDRStmt->execute([
    ":empNum" => $input['empNum'],
    ":selDate" => $input['selDate'],
  ]);
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