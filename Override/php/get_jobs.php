<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "./global_functions.php";
#endregion

#region Initialize Variable
$result = [
  "isSuccess" => FALSE,
  "message" => ''
];
$required_fields = [
  'grpNum' => "Group No.",
  'empNum' => "Employee No.",
  'projID' => "Project ID",
	'itemID' => "Item ID",
];

$input = $_POST;
$missing_fields = [];
#endregion

#region input checking
foreach ($required_fields as $key => $description) {
  if (empty($input[$key])) {
    $missing_fields[] = $description;
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
$itemID = $input['itemID'];
$grpAbrrev = getGroup($input['grpNum']);
$trainProjID = getTrainProjID();
$projID = $input['projID'];
$sharedProjects = getSharedProjects($input['empNum']);
$statement = ($projID == $trainProjID) ? " AND fldItem IS NULL" : " AND fldItem = $itemID";
#endregion


#region MAIN QUERY
try {
	$jobQ = "SELECT `fldID` AS `id`, `fldJob` AS `jobName` FROM drawingreference WHERE fldProject = :projID $statement AND fldActive = 1 AND (fldGroup = :empGroup OR fldGroup IS NULL $sharedProjects) AND fldDelete = 0 ORDER BY fldPriority";
	$jobStmt = $connwebjmr->prepare($jobQ);
	$jobStmt->execute([
		":projID" => $projID, 
		":empGroup" => $grpAbrrev
	]);
	if($jobStmt->rowCount() > 0) {
		$result['result'] = $jobStmt->fetchAll();
    $result['isSuccess'] = TRUE;
    $result['message'] = "Successfully retrieved";
	}
	else{
		$result['isSuccess'] = FALSE;
    $result['message'] = "Failed to retrieve data";
	}
} catch (Exception $e) {
	$result["isSuccess"] = FALSE;
	$result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);