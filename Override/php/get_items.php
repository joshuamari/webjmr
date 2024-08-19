<?php
#region DB Connect
require_once "../../dbconn/dbconnectwebjmr.php";
require_once "./global.php";
#endregion

#region Initialize Variable
$mngStatement = '';
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
$sharedProjects = getSharedProjects($empID);
$mngProjID = getManagementProjects();
$empDesig = getEmpPosition($empID);

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
  $itemStmt->execute([":projID" => $projID, ":empGroup" => $grpAbbr]);
  if($itemStmt->rowCount() > 0) {
    $result = $itemStmt->fetchAll();
    $msg['result'] = $result;
    $msg['isSuccess'] = TRUE;
    $msg['error'] = "Successfully retrieved";
  } else{
    $msg['isSuccess'] = FALSE;
    $msg['error'] = "Failed to retrieve data";
  }
  
} catch (Exception $e) {
	$msg["isSuccess"] = false;
	$msg['error'] =  "Connection failed: " . $e->getMessage();
}

#endregion
echo json_encode($msg);