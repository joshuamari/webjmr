<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "./global.php";
#endregion

#region Initialize Variable
if(!empty($_POST['empNum'])) {
  $empID = $_POST['empNum'];
}
else {
  $msg['isSuccess'] = FALSE;
  $msg['error'][] = "Employee No.";
}
if(!empty($_POST['projID'])){
  $projID = $_POST['projID'];
}
else{
  $msg['isSuccess'] = FALSE;
  $msg['error'][] = "Project ID";
}
if(!empty($_POST['grpNum'])){
  $grpNum = $_POST['grpNum'];
}
else{
  $msg['isSuccess'] = FALSE;
  $msg['error'][] = "Group";
}
$itemID = !empty($_POST['itemID']) ? $_POST['itemID'] : "";
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
$grpAbrrev = getGroup($grpNum);
$trainProjID = getTrainProjID();
$sharedProjects = getSharedProjects($empID);
$statement = ($projID == $trainProjID) ? " AND fldItem IS NULL" : " AND fldItem = $itemID";
#endregion

#region MAIN QUERY
try {
	$jobQ = "SELECT `fldID` AS `id`, `fldJob` AS `jobName` FROM drawingreference WHERE fldProject = :projID $statement AND fldActive = 1 AND (fldGroup = :empGroup OR fldGroup IS NULL $sharedProjects) AND fldDelete = 0 ORDER BY fldPriority";
	$jobStmt = $connwebjmr->prepare($jobQ);
	$jobStmt->execute([":projID" => $projID, ":empGroup" => $grpAbrrev]);
	if($jobStmt->rowCount() > 0) {
		$result = $jobStmt->fetchAll();
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