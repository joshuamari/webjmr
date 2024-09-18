<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "../../dbconn/dbconnectkdtph.php";
require_once "./global_functions.php";
#endregion

#region Initialize Variables
$result = [
  "isSuccess" => FALSE,
  "message" => ''
];
$required_fields = [
  'grpNum' => "Group No.",
  'empNum' => "Employee No.",
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
$projID = (!empty($_POST['projID'])) ? $_POST['projID'] : '';

$defaultProjID = getDefaults();
if(!in_array($projID,$defaultProjID)){
  $projGroupQ = "SELECT fldGroup FROM projectstable WHERE fldID = :projID";
  $projGroupStmt = $connwebjmr->prepare($projGroupQ);
  $projGroupStmt->execute([":projID" => $projID]);
  $projGroup = $projGroupStmt->fetchColumn();
  $grpAbbr = $projGroup;
}

$sharedEmp = "";
$sharedProjQ = "SELECT fldEmployeeNum FROM project_share WHERE fldProject = :projID";
$sharedProjStmt = $connwebjmr->prepare($sharedProjQ);
$sharedProjStmt->execute([":projID" => $projID]);
if($sharedProjStmt->rowCount() > 0){
    $spArr = $sharedProjStmt->fetchAll();
    $arrValues = array_column($spArr, "fldEmployeeNum");
    $implodeString = implode("','", array_values($arrValues));
    $sharedEmp = "OR fldEmployeeNum IN ('" . $implodeString . "')";
}
#endregion

#region Main Query
try {
  $memQ = "SELECT `fldEmployeeNum` AS `id`, CONCAT(`fldFirstName`, ' ', `fldSurname`) AS `name` FROM emp_prof WHERE fldEmployeeNum != :empNum AND (fldGroup = :empGrp :sharedEmp) AND fldActive = 1 AND fldNick != ''";
  $memStmt=$connkdt->prepare($memQ);
  $memStmt->execute([
    ":empNum" => $input['empNum'],
    "empGrp" => $grpAbbr,
    ":sharedEmp" => $sharedEmp,
  ]);
  if($memStmt->rowCount() > 0) {
    $result['result'] = $memStmt->fetchAll();
    $result['isSuccess'] = TRUE;
    $result['message'] = "Successfully retrieved!";
  }
  else{
    $result['isSuccess'] = FALSE;
    $result['message'] = "Retrieve Unsuccessfully!";
  }
} catch (Exception $e) {
  $result["isSuccess"] = FALSE;
  $result['message'] =  "Connection failed: " . $e->getMessage();
}

#endregion

echo json_encode($result);