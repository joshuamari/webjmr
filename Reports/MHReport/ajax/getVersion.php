<?php
$rawJSDateChange=filemtime("../js/main.js");
$wrsJSVersion=date("Ymd",$rawJSDateChange);
echo $wrsJSVersion;
?>