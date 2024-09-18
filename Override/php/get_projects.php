<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "../../dbconn/dbconnectnew.php";
require_once "./global_functions.php";
#endregion

#region Initialize Variable
$projects = [];

$result = [
  "isSuccess" => FALSE,
  "message" => ''
];
$required_fields = [
  'empNum' => "Employee No.",
  'grpNum' => "Group No.",
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

#region for separation of error
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
$grpAbbr = getGroup($input['grpNum']);
// get employee designation
$empDesig = getEmpPosition($input['empNum']);

// Solution Project/s
$solProjID = getSolutionProjects();

// Management Project/s
$mngProjID = getManagementProjects();

// Shared Project/s
$sharedProjects = getSharedProjects($input['empNum']);

$kdtw = (!in_array($grpAbbr,$KDTWAccess)) ? " AND fldID != '$solProjID'" : "";

$mngStatement = (!in_array($empDesig,$managementPositions) && !in_array($input['empNum'],$devs)) ? " AND fldID != '$mngProjID'" : "";
#endregion

#region MAIN QUERY
try {
  $projectQ = "SELECT `fldID` AS `id`, `fldProject` AS `projectName`, `fldGroup` AS `group` FROM projectstable 
               WHERE (fldGroup IS NULL OR fldGroup = :grpAbbr $sharedProjects) AND fldActive = 1 AND fldDelete = 0 $kdtw $mngStatement ORDER BY fldDirect DESC, fldPriority, fldId";
  $projectStmt = $connwebjmr->prepare($projectQ);
  $projectStmt->execute([":grpAbbr" => $grpAbbr]);
  if($projectStmt->rowCount() > 0) {
    $partialres = $projectStmt->fetchAll();
    foreach ($partialres as $proj) {
      $output = array();
      $groupAppend = "";
      if($proj['group'] != $grpAbbr AND $proj['group'] != NULL) {
        $groupAppend = "(" . $proj['group'] . ")";
      }
        $projName = $proj['projectName'];
        $projID = $proj['id'];

        $output += ["id" => $projID];
        $output += ["projName" => $projName];
        $output += ["groupAppend" => $groupAppend];
        array_push($projects,$output);
    }
    $result['result'] = $projects;
    $result['isSuccess'] = TRUE;
    $result['message'] = "Successfully retrieved";
  } else{
    $result['isSuccess'] = FALSE;
    $result['message'] = "Failed to retrieve data";
  }
  
} catch (Exception $e) {
	$result["isSuccess"] = FALSE;
	$result['message'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($result);