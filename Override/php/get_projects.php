<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "../../dbconn/dbconnectnew.php";
require_once "../../Override/php/global.php";
#endregion

#region Initialize Variable
$kdtw = $mngStatement = $sharedProjects = '';
$result = [];
$KDTWAccess = ['SYS', 'ANA', 'IT'];
$managementPositions = ['KDTP', 'SM', 'DM', 'AM', 'SSS', 'SSV', 'IT-SV', 'CTE', 'GM'];
$devs = ['464', '510', '487'];

if(!empty($_POST['grpNum'])){
  $grpNum = $_POST['grpNum'];
}
else{
  $msg['isSuccess'] = FALSE;
  $msg['error'][] = "Group";
}
if(!empty($_POST['empNum'])) {
  $empID = $_POST['empNum'];
}
else {
  $msg['isSuccess'] = FALSE;
  $msg['error'][] = "Employee No.";
}
#endregion

#region separtion of error
if (!empty($msg)) {
	if (count($msg['error']) > 1) {
		$errorString = '';
		foreach ($msg['error'] as $result) {
			if ($result === end($msg['error'])) {
				$errorString .= "and '$result' Missing";
			} else {
				$errorString .= "'$result', ";
			}
		}
		$msg['error'] = $errorString;
	} else {
		$msg['error'] = implode("", $msg['error']);
		$msg['error'] .= " Missing";
	}
	die(json_encode($msg));
}
#endregion

#region ADDITIONAL CONDITION
$grpAbbr = getGroup($grpNum);
// get employee designation
$empDesig = getEmpPosition($empID);

// Solution Project/s
$solProjID = getSolutionProjects();

// Management Project/s
$mngProjID = getManagementProjects();

// Shared Project/s
$sharedProjects = getSharedProjects($empID);

if(!in_array($grpAbbr,$KDTWAccess)){
  $kdtw = " AND fldID != '$solProjID'";
}
if(!in_array($empDesig,$managementPositions) && !in_array($empID,$devs)){
  $mngStatement = " AND fldID != '$mngProjID'";
}
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
      $grpProj = $proj['group'];
      if($proj['group'] != $grpAbbr) {
        $groupAppend = "(" . $grpProj . ")";
      }
        $projName = $proj['projectName'];
        $projID = $proj['id'];

        $output += ["projID"=>$projID];
        $output += ["projName"=>$projName];
        $output += ["groupAppend"=>$groupAppend];
        array_push($result,$output);
    }
    $msg['result'] = $result;
    $msg['isSuccess'] = TRUE;
    $msg['error'] = "Successfully retrieved";
  }
  else{
    $msg['isSuccess'] = FALSE;
    $msg['error'] = "Failed to retrieve data";
  }
  
} catch (Exception $e) {
	$msg["isSuccess"] = false;
	$msg['error'] =  "Connection failed: " . $e->getMessage();
}
#endregion

echo json_encode($msg);