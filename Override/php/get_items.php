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
$grpAbbr = getGroup($input['grpNum']);
$projID = $input['projID'];
$sharedProjects = getSharedProjects($input['empNum']);
$mngProjID = getManagementProjects();
$empDesig = getEmpPosition($input['empNum']);

$mngStatement = '';
if($projID == $mngProjID){
    switch($empDesig){
        case 'SM':
            $mngStatement = " AND fldID = 1";
            break;
        case 'DM':
            if(in_array($empGroup,$KDTWAccess)){
                $mngStatement = " AND fldID = 2";
            }
            else{
                $mngStatement = " AND fldID = 3";
            }
            break;
        case 'AM':
            $mngStatement = " AND fldID = 4";
            break;
        case 'CTE':
            $mngStatement = " AND fldID = 4";
            break;
        case 'SSV':
            $mngStatement = " AND fldID = 5";
            break;
        case 'SSS':
            $mngStatement = " AND fldID = 5";
            break;
    }
}
#endregion

#region MAIN QUERY
try{
  $itemQ = "SELECT `fldID` AS `id`, `fldItem` AS `itemName` FROM itemofworkstable 
            WHERE fldProject = :projID AND fldActive = 1 AND (fldGroup = :empGroup OR fldGroup IS NULL $sharedProjects) AND fldDelete = 0 $mngStatement ORDER BY fldPriority";
  $itemStmt = $connwebjmr->prepare($itemQ);
  $itemStmt->execute([
    ":projID" => $projID, 
    ":empGroup" => $grpAbbr
  ]);
  if($itemStmt->rowCount() > 0) {
    $result['result'] = $itemStmt->fetchAll();
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