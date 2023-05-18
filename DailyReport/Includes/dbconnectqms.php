<?php 
$servername = "localhost";
$username = "root";
$password = "";
try {
  $connqms = new PDO("mysql:host=localhost;dbname=qmsmaindb", $username, $password);
  
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
#region checkLogin
include 'dbconnectkdtph.php';
if(empty($userHash)){ //
  header("Location: ../KDTPortalLogin");
}
else{
  $loginQ="SELECT fldUser FROM kdtlogin WHERE fldUserHash='$userHash'";
  $loginStmt=$connkdt->query($loginQ);
  if($loginStmt->rowCount()>0){
      $pcUserName=$loginStmt->fetchColumn();
  }
  else{
      header("Location: ../KDTPortalLogin");
  }
}
#endregion
#region getOutlook
$emailquery = "SELECT * FROM kdtlogin WHERE fldUser = '$pcUserName'  ";
$emailstmt = $connkdt->prepare($emailquery);
$emailstmt->execute();
while($rowemail = $emailstmt->fetch(/* PDO::FETCH_ASSOC */))
  {
      $userOutlook=$rowemail['fldOutlook'];
  }
#endregion
$profilequery = "SELECT * FROM emp_prof WHERE fldUser = '$pcUserName'  ";
$profilestmt = $connqms->prepare($profilequery);
$profilestmt->execute();
while($rowprofile = $profilestmt->fetch(/* PDO::FETCH_ASSOC */))
  {
    $userNum=$rowprofile['fldEmployeeNum'];
    $userFirstname=$rowprofile['fldFirstname'];
    $userFullName=$rowprofile['fldFirstname']." ".$rowprofile['fldSurname'];
  }
?>
