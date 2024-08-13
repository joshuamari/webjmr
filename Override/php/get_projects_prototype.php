<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "../../dbconn/dbconnectnew.php";
require_once "../../Override/php/global.php";
#endregion

#region Initialize Variable
$kdtw = $mngStatement = $sharedProjects = '';
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
// get employee designation
$getDesigQ = "SELECT `acronym` FROM `employee_list` AS `el`
INNER JOIN `designation_list` AS `dl` ON `dl`.`id` = `el`.`designation`
WHERE `el`.`id` = :empID";
$getDesigStmt = $connnew->prepare($getDesigQ);
$getDesigStmt->execute([":empID" => $empID]);
$empDesig = $getDesigStmt->fetchColumn();

// Solution Project/s
$solProjQ = "SELECT fldID FROM projectstable WHERE fldProject = 'Development, Analysis & IT'";
$solProjStmt = $connkdt->prepare($solProjQ);
$solProjStmt->execute([]);
$solProjID = $solProjStmt->fetchColumn();

// Management Project/s
$mngProjQ = "SELECT fldID FROM projectstable WHERE fldProject='Management'";
$mngProjStmt = $connkdt->prepare($mngProjQ);
$mngProjStmt->execute([]);
$mngProjID = $mngProjStmt->fetchColumn();

// Shared Project/s
$sharedProjects = getSharedProjects($empID);

if(!in_array($grpNum,$KDTWAccess)){
  $kdtw = " AND fldID != '$solProjID'";
}
if(!in_array($empDesig,$managementPositions) && !in_array($empID,$devs)){
  $mngStatement = " AND fldID != '$mngProjID'";
}
#endregion

#region MAIN QUERY
try {
  $projectQ = "SELECT `fldID` AS `id`, `fldProject` AS `projectName` FROM projectstable 
      WHERE (fldGroup IS NULL OR fldGroup = :grpNum $sharedProjects) AND fldActive = 1 AND fldDelete = 0 $kdtw $mngStatement ORDER BY fldDirect DESC, fldPriority, fldId";
  $projectStmt = $connkdt->prepare($projectQ);
  $projectStmt->execute([":grpNum" => $grpNum]);
  if($projectStmt->rowCount() > 0) {
    $result = $projectStmt->fetchAll();
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