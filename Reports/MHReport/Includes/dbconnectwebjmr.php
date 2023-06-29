<?php
$config = [
  'host' => 'localhost',
  'port' => 3306,
  'dbname' => 'webjmrdb',
  'charset' => 'utf8mb4'
];
$username = 'root';
$password = '';
$dsn = 'mysql:' . http_build_query($config, '', ';');
try {
  $connwebjmr = new PDO($dsn, $username, $password,[
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]);
  $defaultProjID=array();
  $dProjQ="SELECT * FROM projectstable WHERE fldDirect=0 AND fldDelete=0";
  $dProjStmt=$connwebjmr->query($dProjQ);
  if($dProjStmt->rowCount()>0){
    $dProjArr=$dProjStmt->fetchAll();
    foreach($dProjArr AS $dProj){
      array_push($defaultProjID,$dProj['fldID']);
    }
  }
  $leaveQ="SELECT fldID FROM projectstable WHERE fldProject='Leave'";
  $leaveStmt=$connwebjmr->query($leaveQ);
  $leaveID=$leaveStmt->fetchColumn();
  $mngProjQ="SELECT fldID FROM projectstable WHERE fldProject='Management'";
  $mngProjStmt=$connwebjmr->query($mngProjQ);
  $mngProjID=$mngProjStmt->fetchColumn();
  $trainProjQ="SELECT fldID FROM projectstable WHERE fldProject='Training'";
  $trainProjStmt=$connwebjmr->query($trainProjQ);
  $trainProjID=$trainProjStmt->fetchColumn();
  $solProjQ="SELECT fldID FROM projectstable WHERE fldProject='Development, Analysis & IT'";
  $solProjStmt=$connwebjmr->query($solProjQ);
  $solProjID=$solProjStmt->fetchColumn();
  
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
?>

