<?php
#region Functions
function getID()
{
    global $connpcs;
    $empID = 0;

    if (!empty($_COOKIE["userID"])) {
        $userHash = $_COOKIE["userID"];
    }
    $empidQ = "SELECT fldEmployeeNum as empID FROM kdtphdb.kdtlogin WHERE fldUserHash = :userHash";
    $empidStmt = $connpcs->prepare($empidQ);
    $empidStmt->execute([":userHash" => "$userHash"]);
    if ($empidStmt->rowCount() > 0) {
        $empID = $empidStmt->fetchColumn();
    }
    return $empID;
}

#endregion
