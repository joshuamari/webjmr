<?php
$ajaxArr = $_REQUEST["busterCall"];//files for cache busting
$titleName = $_REQUEST["titleName"];
//headstring is for replacing contents in html <head>
$headString="<title>$titleName</title>
<meta name='viewport' content='width=device-width, initial-scale=1'>
<meta charset='UTF-8'>
<link rel='stylesheet' href='css/bootstrap.min.css'>
<link rel='stylesheet' type='text/css' href='css/font-awesome.css'>
<link rel='stylesheet' href='css/boxicons.css'>

<script src='js/jquery.js'></script>
<script src='js/jquery.inview.min.js'></script>
<script src='js/popper.js'></script>";
$addString = "";

foreach($ajaxArr AS $element){
    switch(explode("/",$element)[0]){
        case "js":
            $version = date("YmdHis",filemtime("../$element"));
            $addString .= "<script src='$element?version=$version'></script>";
            break;
        case "css":
            $version = date("YmdHis",filemtime("../$element"));
            $addString .= "<link rel='stylesheet' type='text/css' href='$element?v=$version'>";
            break;
    }
}
echo $headString.$addString;
?>