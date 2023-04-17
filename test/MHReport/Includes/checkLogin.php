<?php
include 'dbconnectkdtph.php';
$output=1;
if(!isset($_COOKIE["userID"])){ //
    $output=0;
}
else{
    $userHash=$_COOKIE["userID"];
    $loginQ="SELECT fldUser FROM kdtlogin WHERE fldUserHash='$userHash'";
    $loginStmt=$connkdt->query($loginQ);
    if($loginStmt->rowCount()>0){
        $pcUserName=$loginStmt->fetchColumn();
    }
    else{
        $output=0;
    }
}
echo $output;
?>