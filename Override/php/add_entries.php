<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "../../Override/php/global.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region Initialize Variable
$required_fields = [
  'overrideEmpNum' => 'Override User Employee No.',
  'empNum' => "Employee No.",
  'grpNum' => "Group No.",
  'selDate' => "Selected Date",
  'locID' => "Location",
  'projID' => "Project ID",
  'itemID' => "Item ID",
  'duration' => "Duration",
  'manhour' => "Manhour Type",
];

$input = $_POST;
$missing_fields = [];
#endregion
#initialize Session
session_start();

#region input checking
foreach ($required_fields as $key => $descrpition) {
  if (empty($input[$key]) && $key != 'manhour') {
    $missing_fields[] = $descrpition;
  }
  if($key == 'manhour') {
    if(!isset($input[$key])) {
      $missing_fields[] = $descrpition;
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
$grpAbbrev =  getGroup($input['grpNum']);
$jobReqDesc = (!empty($_POST['jobReqDesc'])) ? $_POST['jobReqDesc'] : null;
$twoDthreeD = (!empty($_POST['2D3DDesc'])) ? $_POST['2D3DDesc'] : null;
$revisions = (!empty($_POST['2D3DDesc'])) ? $_POST['2D3DDesc'] : 0;
$typeOfWork = (!empty($_POST['2D3DDesc'])) ? $_POST['2D3DDesc'] : '';
$checker = (!empty($_POST['checker'])) ? $_POST['checker'] : null;
$remarks = (!empty($_POST['remarks'])) ? $_POST['remarks'] : null;
$trGrp = (!empty($_POST['trGrp'])) ? $_POST['trGrp'] : null;
$logs=date("YmdHis") . "_" . $input['overrideEmpNum'];
#endregion

#region Main Query
try {
  $insertDRQ = "INSERT INTO dailyreport(fldEmployeeNum, fldGroup, fldGroupID, fldDate, fldLocation, fldProject, fldItem, fldJobRequestDescription, fld2D3D, fldRevision, fldTOW, fldChecker,fldDuration, fldMHType, fldRemarks, fldTrGroup, fldChangeLog)
                VALUES(:empNum, :grpAbbrev, :grpID, :selDate,:locID, :projID, :itemID, :jobReqDesc, :twoDthreeD, :revisions, :typeOfWork, :checker, :duration, :manhour, :remarks, :trGrp, :logs)";
  $insertDRStmt = $connwebjmr->prepare($insertDRQ);
  $insertDRStmt->execute([
    ":empNum" => $input['empNum'],
    ":grpAbbrev" => $grpAbbrev,
    ":grpID" => $input['grpNum'],
    ":selDate" => $input['selDate'],
    ":locID" => $input['locID'],
    ":projID" => $input['projID'],
    ":itemID" => $input['itemID'],
    ":jobReqDesc" => $jobReqDesc,
    ":twoDthreeD" => $twoDthreeD,
    ":revisions" => $revisions,
    ":typeOfWork" => $typeOfWork,
    ":checker" => $checker,
    ":duration" => $input['duration'],
    ":manhour" => $input['manhour'],
    ":remarks" => $remarks,
    ":trGrp" => $trGrp,
    ":logs" => $logs
  ]);
  if($insertDRStmt->rowCount() > 0) {
    $result['isSuccess'] = true;
    $result['message'] = "Entries Added Successfully";
  }
  else{
    $result['isSuccess'] = false;
    $result['message'] = "Failed to Add Entries";
  }

} catch (Exception $e) {
  $result["isSuccess"] = false;
  $result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);