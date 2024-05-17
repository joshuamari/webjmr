<?php
require_once "dbconnectkdtph.php";
require_once "dbconnectwebjmr.php";

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

function getName($empnum)
{
    global $connkdt;
    $empname = [];
    $nameQ = "SELECT fldFirstname,fldSurname FROM emp_prof WHERE fldEmployeeNum =:empnum";
    $nameStmt = $connkdt->prepare($nameQ);
    $nameStmt->execute([":empnum" => $empnum]);
    if ($nameStmt->rowCount() > 0) {
        $emp = $nameStmt->fetch();
        $empname["firstName"] = $emp["fldFirstname"];
        $empname["lastName"] = $emp["fldSurname"];
    }
    return $empname;
}
