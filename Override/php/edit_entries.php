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
  'overrideEmpNum' => 'Override User Employee No.',
  'locID' => "Location",
  'projID' => "Project ID",
  'itemID' => "Item ID",
  'duration' => "Duration",
  'manhour' => "Manhour Type",
  'drID' => "Daily Report ID",
];
$input = $_POST;
$missing_fields = [];
#endregion

#region input checking
foreach ($required_fields as $key => $description) {
  if (empty($input[$key]) && $key != 'manhour') {
    $missing_fields[] = $description;
  }
  if($key == 'manhour') {
    if(!isset($input[$key])) {
      $missing_fields[] = $description;
    }
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

#region ADDITIONAL CONDITION
$jobReqDesc = (!empty($_POST['jobReqDesc'])) ? $_POST['jobReqDesc'] : null;
$twoDthreeD = (!empty($_POST['2D3DDesc'])) ? $_POST['2D3DDesc'] : null;
$revisions = (!empty($_POST['2D3DDesc'])) ? $_POST['2D3DDesc'] : 0;
$typeOfWork = (!empty($_POST['2D3DDesc'])) ? $_POST['2D3DDesc'] : '';
$checker = (!empty($_POST['checker'])) ? $_POST['checker'] : null;
$remarks = (!empty($_POST['remarks'])) ? $_POST['remarks'] : null;
$trGrp = (!empty($_POST['trGrp'])) ? $_POST['trGrp'] : null;
$logs = date("YmdHis") . "_" . $input['overrideEmpNum'];
#endregion

#region Main Query
try{
  $updateEntryQ = "UPDATE `dailyreport` 
                   SET `fldLocation` = :locID, 
                       `fldProject` = :projID, 
                       `fldItem` = :itemID, 
                       `fldJobRequestDescription` = :jobReqDesc, 
                       `fld2D3D` = :twoDthreeD, 
                       `fldRevision` = :revisions, 
                       `fldTOW` = :TOWID, 
                       `fldChecker` = :checker, 
                       `fldDuration` = :duration, 
                       `fldMHType` = :MHType, 
                       `fldRemarks` = :remarks, 
                       `fldTrGroup` = :trGrp, 
                       `fldChangeLog` = :logs 
                       WHERE fldID = :drID";
  $updateEntryStmt = $connwebjmr->prepare($updateEntryQ);
  $updateEntryStmt->execute([
    ":locID" => $input['locID'],
    ":projID" => $input['projID'],
    ":itemID" => $input['itemID'],
    ":jobReqDesc" => $jobReqDesc,
    ":twoDthreeD" => $twoDthreeD,
    ":revisions" => $revisions,
    ":TOWID" => $typeOfWork,
    ":checker" => $checker,
    ":duration" => $input['duration'],
    ":MHType" => $input['manhour'],
    ":remarks" => $remarks,
    ":trGrp" => $trGrp,
    ":logs" => $logs,
    ":drID" => $input['drID'],
  ]);
  if($updateEntryStmt->rowCount() > 0) {
    $result['isSuccess'] = TRUE;
    $result['message'] = "Edit Entry Successfully";
  }
  else{
    $result['isSuccess'] = FALSE;
    $result['message'] = "Failed to Edit an Entry";
  }
} catch (Exception $e) {
  $result["isSuccess"] = FALSE;
  $result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);