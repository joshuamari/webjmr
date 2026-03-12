<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "./global_var.php";
#endregion

#region Initialize Variable
$addType = 0;
if(!empty($_POST['addType'])){
    $addType = $_POST['addType'];
}
$result = [
  "isSuccess" => FALSE,
  "message" => ''
];
$required_fields = [
  'empNum' => "Employee No.",
  'grpNum' => "Group No.",
  'getDate' => "Selected Date",
  'getLocation' => "Location",
  'getProject' => "Project ID",
  'getItem' => "Item ID",
  'getDuration' => "Duration",
  'getMHType' => "Manhour Type",
];

$input = $_POST;
$missing_fields = [];
#endregion

#region input checking
foreach ($required_fields as $key => $description) {
  if (empty($input[$key]) && $key != 'getMHType') {
    $missing_fields[] = $description;
  }
  if($key == 'getMHType') {
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
$grpAbbrev =  getGroup($input['grpNum']);
$jobReqDesc = (!empty($_POST['getDescription'])) ? $_POST['getDescription'] : null;
$twoDthreeD = (!empty($_POST['getTwoThree'])) ? $_POST['getTwoThree'] : null;
$revisions = (!empty($_POST['getRev'])) ? $_POST['getRev'] : 0;
$typeOfWork = (!empty($_POST['getType'])) ? $_POST['getType'] : '';
$checker = (!empty($_POST['getChecking'])) ? $_POST['getChecking'] : null;
$remarks = (!empty($_POST['getRemarks'])) ? $_POST['getRemarks'] : null;
$trGrp = (!empty($_POST['getTrGrp'])) ? $_POST['getTrGrp'] : null;
$logs=date("YmdHis") . "_" . $input['empNum'];
#endregion

try {
	switch($addType){
	case "0":
					$insertDRQ="INSERT INTO dailyreport(fldEmployeeNum, fldGroup, fldGroupID, fldDate, fldLocation, fldProject, fldItem, fldJobRequestDescription, fld2D3D, fldRevision, fldTOW, fldChecker, fldDuration, fldMHType, fldRemarks, fldChangeLog, fldTrGroup) 
	VALUES(:empNum, :grpAbbrev, :grpID, :drDate, :getLocation, :getProject, :getItem, :getDescription, :getTwoThree, :getRev, :getType, :getChecking, :getDuration, :getMHType, :getRemarks,:logs, :getTrGrp)";
					break;
			default:
					$insertDRQ="UPDATE dailyreport SET fldEmployeeNum=:empNum, fldGroup=:grpAbbrev, fldGroupID=:grpID, fldDate=:drDate, fldLocation=:getLocation, fldProject=:getProject, fldItem=:getItem, fldJobRequestDescription=:getDescription, fld2D3D=:getTwoThree, fldRevision=:getRev, fldTOW=:getType, fldChecker=:getChecking, fldDuration=:getDuration, fldMHType=:getMHType, fldRemarks=:getRemarks, fldChangeLog=:logs, fldTrGroup=:getTrGrp WHERE fldID=$addType";
					break;
	}
	// $insertDRQ="INSERT INTO dailyreport(fldEmployeeNum,fldGroup,fldDate,fldLocation,fldProject,fldItem,fldJobRequestDescription,fld2D3D,fldRevision,fldTOW,fldChecker,fldDuration,fldMHType,fldRemarks,fldChangeLog) 
	// VALUES(:empNum,:getGroup,:drDate,:getLocation,:getProject,:getItem,:getDescription,:getTwoThree,:getRev,:getType,:getChecking,:getDuration,:getMHType,:getRemarks,:logs)";
	$insertDRStmt=$connwebjmr->prepare($insertDRQ);
	$resultInsertDR=$insertDRStmt->execute([
			":empNum" => $input['empNum'],
			":grpAbbrev"=>$grpAbbrev,
			":grpID" => $input['grpNum'],
			":drDate"=>$input['getDate'],
			":getLocation"=>$input['getLocation'],
			":getProject"=>$input['getProject'],
			":getItem"=>$input['getItem'],
			":getDescription"=>$jobReqDesc,
			":getTwoThree"=>$twoDthreeD,
			":getRev"=>$revisions,
			":getType"=>$typeOfWork,
			":getChecking"=>$checker,
			":getDuration"=>$input['getDuration'],
			":getMHType"=>$input['getMHType'],
			":getRemarks"=>$remarks,
			":logs"=>$logs,
			":getTrGrp"=>$trGrp
		]);
		if($addType == 0) {
			if($insertDRStmt->rowCount() > 0) {
				$result['isSuccess'] = TRUE;
				$result['message'] = "Entries Added Successfully";
			}
			else{
				$result['isSuccess'] = FALSE;
				$result['message'] = "Failed to Add Entries";
			}
		}	else {
			if($insertDRStmt->rowCount() > 0) {
				$result['isSuccess'] = TRUE;
				$result['message'] = "Entries Edited Successfully";
			}
			else{
				$result['isSuccess'] = FALSE;
				$result['message'] = "Failed to Edit Entries";
			}
		}
} catch (Exception $e) {
  $result["isSuccess"] = FALSE;
  $result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);
?>