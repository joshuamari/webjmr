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
  $connwebjmr = new PDO($dsn, $username, $password, [
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
  ]);
  $leaveQ = "SELECT fldID FROM `projectstable` WHERE fldProject='Leave'";
  $leaveStmt = $connwebjmr->query($leaveQ);
  $leaveID = (int)$leaveStmt->fetchColumn();
  $mngProjQ = "SELECT fldID FROM projectstable WHERE fldProject='Management'";
  $mngProjStmt = $connwebjmr->query($mngProjQ);
  $mngProjID = (int)$mngProjStmt->fetchColumn();
  $solProjQ = "SELECT fldID FROM projectstable WHERE fldProject='Development, Analysis & IT'";
  $solProjStmt = $connwebjmr->query($solProjQ);
  $solProjID = (int)$solProjStmt->fetchColumn();
  $excludeGroups = ['SHI', 'INT', 'SYS', 'TEG', 'ADM', 'ACT', 'MNG', 'DXT', 'IT'];
} catch (PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
