<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$result = [
  "isSuccess" => false,
  "message" => ''
];
$required_fields = [
  'empID' => "Employee ID",
  'overrideEmpID' => "Override User Employee ID",
  'selDate' => "Selected Date",
  'copyDate' => "Copy From Date",
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

#region extra for the logs
$logs = date("YmdHis") . "_" . $input['overrideEmpID'];
#endregion

#region for preparation of log that will be inserted
$copiedDRQ = "INSERT INTO `dailyreport`(`fldEmployeeNum`, 
                                        `fldGroup`,
                                        `fldGroupID`,
                                        `fldDate`,
                                        `fldLocation`,
                                        `fldProject`,
                                        `fldItem`, 
                                        `fldJobRequestDescription`, 
                                        `fld2D3D`, 
                                        `fldRevision`, 
                                        `fldTOW`, 
                                        `fldChecker`, 
                                        `fldDuration`, 
                                        `fldMHType`, 
                                        `fldRemarks`, 
                                        `fldTrGroup`, 
                                        `fldChangeLog`)
              VALUES(:empNum,
                     :grpAbr,
                     :grpID,
                     :selDate,
                     :locID,
                     :projID,
                     :itemID,
                     :jobReqDesc,
                     :twoDthreeD,
                     :revision,
                     :TOWID,
                     :checker,
                     :duration,
                     :MHType,
                     :remarks,
                     :trGrp,
                     :logs)";
$copiedDRStmt = $connwebjmr->prepare($copiedDRQ);
#endregion

#region Main Query
try{
  $copyFromDRQ = "SELECT `dr`.*, `pt`.`fldDelete` AS `projDel`
                  FROM `dailyreport` AS `dr`
                  JOIN `projectstable` AS `pt`
                  ON `dr`.`fldProject` = `pt`.`fldID`
                  WHERE `dr`.`fldEmployeeNum` = :empNum AND `dr`.`fldDate` = :copyDate";
  $copyFromDRStmt = $connwebjmr->prepare($copyFromDRQ);
  $copyFromDRStmt->execute([
    ":empNum" => $input['empID'],
    ":copyDate" => $input['copyDate']
  ]);
  if($copyFromDRStmt->rowCount() > 0) {
    $resultArr = $copyFromDRStmt->fetchAll();
    foreach($resultArr AS $res) {
      if($res['projDel'] == 0) {
        $copiedDRStmt->execute([
          ":empNum" => $input['empID'],
          ":grpAbr" => $res['fldGroup'],
          ":grpID" => $res['fldGroupID'],
          ":selDate" => $input['selDate'],
          ":locID" => $res['fldLocation'],
          ":projID" => $res['fldProject'],
          ":itemID" => $res['fldItem'],
          ":jobReqDesc" => $res['fldJobRequestDescription'],
          ":twoDthreeD" => $res['fld2D3D'],
          ":revision" => $res['fldRevision'],
          ":TOWID" => $res['fldTOW'],
          ":checker" => $res['fldChecker'],
          ":duration" => $res['fldDuration'],
          ":MHType" => $res['fldMHType'],
          ":remarks" => $res['fldRemarks'],
          ":trGrp" => $res['fldTrGroup'],
          ":logs" => $logs,
        ]);
      }
    }
    $result['isSuccess'] = true;
    $result['message'] = "Entries Copied Successfully";
  }
  else{
    $result['isSuccess'] = false;
    $result['message'] = "Failed to Copy Entries";
  }
} catch (Exception $e) {
  $result["isSuccess"] = false;
  $result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);