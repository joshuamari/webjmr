<?php
#region Require Database Connections
require_once '../Includes/dbconnectkdtph.php';
#endregion

#region set timezone
date_default_timezone_set('Asia/Manila');
#endregion

#region initialize variables
$output='<option value="" hidden selected>Select BUIC</option>';
#endregion

#region main

$groupsQuery= "SELECT * FROM kdtbu WHERE fldDepartment<>'' ORDER BY fldBU";
$groupsStmt = $connkdt->query($groupsQuery);
while($rowgrp = $groupsStmt->fetch()){
    $grp=$rowgrp['fldBU'];
    $output.='<option>'.$rowgrp['fldBU'].'</option>';
}
#endregion

#region function

#endregion
echo $output;
?>