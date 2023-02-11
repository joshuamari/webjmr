<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
require_once "../Includes/dbconnectwebjmr.php";
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$page_id_array=array();
if(!empty($_POST['page_id_array'])){
    $page_id_array=$_POST['page_id_array'];
}
#endregion

#region main
for($count=0; $count < count($page_id_array);$count++){
    $prioQ="UPDATE drawingreference SET fldPriority='".($count+1)."' WHERE fldID='".$page_id_array[$count]."'";
    $prioStmt=$connwebjmr->query($prioQ);
}
#endregion

#region function

#endregion
//$.ajaxSetup({async: false});
?>