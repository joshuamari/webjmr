<?php
$config = [
  'host' => 'kdt-admin',
    'dbname' => 'webjmrdb',
    'charset' => 'utf8mb4',
    'port' => 3000
];
$username = 'dev';
$password = 'dev';
$dsn = 'mysql:' . http_build_query($config, '', ';');
try {
  $connwebjmr = new PDO($dsn, $username, $password, [
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
  ]);
  $defaultProjID = array();
  $dProjQ = "SELECT * FROM projectstable WHERE fldDirect=0 AND fldDelete=0";
  $dProjStmt = $connwebjmr->query($dProjQ);
  if ($dProjStmt->rowCount() > 0) {
    $dProjArr = $dProjStmt->fetchAll();
    foreach ($dProjArr as $dProj) {
      array_push($defaultProjID, $dProj['fldID']);
    }
  }
  $leaveQ = "SELECT fldID FROM projectstable WHERE fldProject='Leave'";
  $leaveStmt = $connwebjmr->query($leaveQ);
  $leaveID = $leaveStmt->fetchColumn();

  $solProjQ = "SELECT fldID FROM projectstable WHERE fldProject='Development, Analysis & IT'";
  $solProjStmt = $connwebjmr->query($solProjQ);
  $solProjID = $solProjStmt->fetchColumn();

  $mngProjQ = "SELECT fldID FROM projectstable WHERE fldProject='Management'";
  $mngProjStmt = $connwebjmr->query($mngProjQ);
  $mngProjID = $mngProjStmt->fetchColumn();

  $otherProjQ = "SELECT fldID FROM projectstable WHERE fldProject='Business Trip & Other'";
  $otherProjStmt = $connwebjmr->query($otherProjQ);
  $otherProjID = $otherProjStmt->fetchColumn();

  $kiaProjQ = "SELECT fldID FROM projectstable WHERE fldProject='KDT Internal Activities'";
  $kiaProjStmt = $connwebjmr->query($kiaProjQ);
  $kiaProjID = $kiaProjStmt->fetchColumn();

  $trainProjQ = "SELECT fldID FROM projectstable WHERE fldProject='Training'";
  $trainProjStmt = $connwebjmr->query($trainProjQ);
  $trainProjID = $trainProjStmt->fetchColumn();

  $obuTrainQ = "SELECT fldID FROM itemofworkstable WHERE fldItem='Trainer for One BU Participants'";
  $obuTrainStmt = $connwebjmr->query($obuTrainQ);
  $oneBUTrainerID = $obuTrainStmt->fetchColumn();

  $KDTWAccess = ['SYS', 'ANA', 'IT'];
  $managementPositions = ['KDTP', 'SM', 'DM', 'AM', 'SSS', 'SSV', 'IT-SV', 'CTE', 'GM'];
  $gods = ['464', '510', '487'];
  $noMoreInputItemOfWorks = ['6', '10', '15', '17', '19', '21'];
  date_default_timezone_set('Asia/Manila');
} catch (PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
