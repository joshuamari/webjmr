<?php
#region DB Connect
require_once "../Includes/dbconnectwebjmr.php";
#endregion
#region Initialize Variables
$id='';
if(isset($_REQUEST['id'])){
    $id=$_REQUEST['id'];
}
$editJName='';
if(!empty($_POST['editJName'])){
    $editJName=$_POST['editJName'];
}
$editJSheet=NULL;
if(!empty($_POST['editJSheet'])){
    $editJSheet=$_POST['editJSheet'];
}
$editJPaper=NULL;
if(!empty($_POST['editJPaper'])){
    $editJPaper=$_POST['editJPaper'];
}
$editJDraw='';
if(!empty($_POST['editJDraw'])){
    $editJDraw=$_POST['editJDraw'];
}
$editJKHIReq=NULL;
if(!empty($_POST['editJKHIReq'])){
    $editJKHIReq=$_POST['editJKHIReq'];
}
$editJKHIC=NULL;
if(!empty($_POST['editJKHIC'])){
    $editJKHIC=$_POST['editJKHIC'];
}
$editJKHIDead=NULL;
if(!empty($_POST['editJKHIDead'])){
    $editJKHIDead=$_POST['editJKHIDead'];
}
$editJKDTDead=NULL;
if(!empty($_POST['editJKDTDead'])){
    $editJKDTDead=$_POST['editJKDTDead'];
}
$editJMH=NULL;
if(!empty($_POST['editJMH'])){
    $editJMH=$_POST['editJMH'];
}
$editJPrep=NULL;
if(!empty($_POST['editJPrep'])){
    $editJPrep=$_POST['editJPrep'];
}
#endregion
#region Update Query
$updateQ="UPDATE drawingreference SET fldJob=:editJName,fldNoSheets=:editJSheet,fldPaperSize=:editJPaper,fldDrawingName=:editJDraw,fldKHIDate=:editJKHIReq,fldKHIC=:editJKHIC,fldKHIDeadline=:editJKHIDead,fldKDTDeadline=:editJKDTDead,fldExpectedMH=:editJMH,fldKHIPrep=:editJPrep WHERE fldID=:id";
$updateStmt=$connwebjmr->prepare($updateQ);
$updateStmt->execute([":id"=>$id,":editJName"=>$editJName,":editJSheet"=>$editJSheet,":editJPaper"=>$editJPaper,":editJDraw"=>$editJDraw,":editJKHIReq"=>$editJKHIReq,":editJKHIC"=>$editJKHIC,":editJKHIDead"=>$editJKHIDead,":editJKDTDead"=>$editJKDTDead,":editJMH"=>$editJMH,":editJPrep"=>$editJPrep]);
#endregion
var_dump($updateStmt);
?>