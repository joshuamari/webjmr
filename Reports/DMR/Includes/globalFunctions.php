<?php
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

function getFirstday($yearMonthValue)
{
    $firstDay = date("Y-m-01", strtotime($yearMonthValue));
    if (date('D', strtotime($firstDay)) !== 'Mon') {
        $firstDay = date("Y-m-d", strtotime("last Monday", strtotime($firstDay)));
    }
    return $firstDay;
}

function getLastday($yearMonthValue)
{
    $lastDay = date("Y-m-t", strtotime($yearMonthValue));
    if (date('D', strtotime($lastDay)) !== 'Sun') {
        $lastDay = date("Y-m-d", strtotime("next Sunday", strtotime($lastDay)));
    }
    return $lastDay;
}
