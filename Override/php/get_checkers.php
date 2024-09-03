<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "../../dbconn/dbconnectkdtph.php";
require_once "../../Override/php/global.php";
#endregion

#region Initialize Variables
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
$grpAbbr = getGroup($grpNum);
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
if($sharedProjStmt->rowCount()>0){
    $spArr = $sharedProjStmt->fetchAll();
    $arrValues = array_column($spArr, "fldEmployeeNum");
    $implodeString = implode("','",array_values($arrValues));
    $sharedEmp = "OR fldEmployeeNum IN ('" . $implodeString . "')";
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

#region Main Query
$memQ = "SELECT `fldEmployeeNum` AS `id`, CONCAT(`fldFirstName`, ' ', `fldSurname`) AS `name` FROM emp_prof WHERE fldEmployeeNum != :empNum AND (fldGroup = :empGrp :sharedEmp) AND fldActive = 1 AND fldNick != ''";
$memStmt=$connkdt->prepare($memQ);
$memStmt->execute([":empNum" => $empID, "empGrp" => $grpAbbr, ":sharedEmp" => $sharedEmp]);
if($memStmt->rowCount() > 0) {
  $result = $memStmt->fetchAll();
  $msg['isSuccess'] = TRUE;
  $msg['result'] = $result;
  $msg['error'] = "Successfully retrieved!";
}
else{
  $msg['isSuccess'] = FALSE;
  $msg['error'] = "Retrieve Unsuccessfully!";
}
#endregion

echo json_encode($msg);