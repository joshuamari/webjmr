<?php
#region Functions

#region Authentication
function getLoginDetails($userhash)
{
    global $connnew;
    $empDetails = [];
    $empQ = "SELECT `el`.surname,`el`.firstname,`el`.id,`el`.group_id FROM `kdtphdb`.kdtlogin kl JOIN `kdtphdb_new`.employee_list el ON `kl`.fldEmployeeNum = `el`.id WHERE `kl`.fldUserHash =:userHash";
    $empStmt = $connnew->prepare($empQ);
    $empStmt->execute([":userHash" => $userhash]);
    if ($empStmt->rowCount() > 0) {
        $empArr = $empStmt->fetch();
        $empDetails = $empArr;
    }
    return $empDetails;
}
function getHash()
{
    $userHash = '';
    if (isset($_COOKIE['userID'])) {
        $userHash = $_COOKIE['userID'];
    }
    return $userHash;
}
function checkAuthentication()
{
    $result = [
        'isSuccess' => FALSE,
        'message' => ''
    ];
    $userhash = getHash();
    $empDetails = getLoginDetails($userhash);
    try {
        if (!empty($userhash)) {
            if (!empty($empDetails)) {
                $result['data'] = $empDetails;
                $result['isSuccess'] = TRUE;
                $result['message'] = 'success';
            } else {
                $result["message"] = "User not found";
            }
        } else {
            $result["message"] = "Not logged in";
        }
    } catch (PDOException $e) {
        $result['isSuccess'] = FALSE;
        $result['message'] = "Connection failed: " . $e->getMessage();
    }

    return $result;
}
#endregion

#region Authorization
function checkAccess($permission_id, $employee_id)
{
    global $connkdt;
    $access = FALSE;
    $accessQ = "SELECT COUNT(*) FROM user_permissions WHERE permission_id = :permissionID AND fldEmployeeNum = :empID";
    $accessStmt = $connkdt->prepare($accessQ);
    $accessStmt->execute([":empID" => $employee_id, ":permissionID" => $permission_id]);
    $ac = $accessStmt->fetchColumn();
    if ($ac) {
        $access = TRUE;
    }
    return $access;
}
function getMHReportAccess($id)
{
    $permissionID = 3;
    return checkAccess($permissionID, $id);
}
#endregion

#region Group Functions
function getGroups($empnum, $permission_id)
{
    global $connnew;
    $allGroupAccess = checkAccess($permission_id, $empnum);
    $myGroups = array();
    if (!$allGroupAccess) {
        $groupsQ = "SELECT `eg`.group_id,`gl`.abbreviation,`gl`.name FROM `employee_group` eg JOIN `group_list` gl ON `eg`.group_id=`gl`.id WHERE `employee_number` = :empnum ORDER BY `gl`.name";
        $groupsStmt = $connnew->prepare($groupsQ);
        $groupsStmt->execute([":empnum" => $empnum]);
        if ($groupsStmt->rowCount() > 0) {
            $groupArr = $groupsStmt->fetchAll();
            foreach ($groupArr as $grp) {
                $output = array();
                $output['group_id'] = $grp['group_id'];
                $output['name'] = $grp['name'];
                $output['abbreviation'] = $grp['abbreviation'];
                array_push($myGroups, $output);
            }
        }
    } else {
        $groupsQ = "SELECT `id`,`abbreviation`,`name` FROM `group_list` ORDER BY `name`";
        $groupsStmt = $connnew->prepare($groupsQ);
        $groupsStmt->execute();
        if ($groupsStmt->rowCount() > 0) {
            $groupArr = $groupsStmt->fetchAll();
            foreach ($groupArr as $grp) {
                $output = array();
                $output['group_id'] = $grp['id'];
                $output['name'] = $grp['name'];
                $output['abbreviation'] = $grp['abbreviation'];
                array_push($myGroups, $output);
            }
        }
    }
    return $myGroups;
}
function getGroupByID($groupid)
{
    global $connnew;
    $grp = "";
    $grpQ = "SELECT `abbreviation` FROM `group_list` WHERE `id`=:groupid";
    $grpStmt = $connnew->prepare($grpQ);
    $grpStmt->execute([":groupid" => $groupid]);
    if ($grpStmt->rowCount() > 0) {
        $grp = $grpStmt->fetchColumn();
    }
    return $grp;
}
#endregion


#region Date Functions
function getFirstday($yearMonthValue, $cutOffValue)
{
    $firstDay = date("Y-m-01", strtotime($yearMonthValue));
    switch ($cutOffValue) {
        case "4":
            $firstDay = date('Y-m-d', strtotime('last week'));
            break;
        case "5":
            $firstDay = date('Y-m-d', strtotime('this week'));
            break;
    }
    return $firstDay;
}
function getLastday($yearMonthValue, $cutOffValue, $firstd)
{
    $lastDay = date("Y-m-16", strtotime($yearMonthValue));
    switch ($cutOffValue) {
        case "3":
            $lastDay = date('Y-m-d', strtotime($firstd . '+ 1 month'));
            break;
        case "4":
            $lastDay = date('Y-m-d', strtotime('last week +6 days'));
            break;
        case "5":
            $lastDay = date('Y-m-d', strtotime('this week +6 days'));
            break;
    }
    return $lastDay;
}
#endregion


#region text formatting
function stringify($string)
{
    $stringRet = $string;
    if (strpos($string, "'")) {
        $stringRet = str_replace("'", "&apos;", $string);
    } else if (strpos($string, '"')) {
        $stringRet = str_replace("'", "&quot;", $string);
    }
    return $stringRet;
}
#endregion


#endregion
