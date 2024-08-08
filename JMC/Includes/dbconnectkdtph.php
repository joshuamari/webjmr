<?php
$config = [
  'host' => 'localhost',
  'port' => 3306,
  'dbname' => 'kdtphdb',
  'charset' => 'utf8mb4'
];
$username = 'root';
$password = '';
$dsn = 'mysql:' . http_build_query($config, '', ';');
try {
  $connkdt = new PDO($dsn, $username, $password, [
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
  ]);
  $devs = ["464", "510", "487"];
  $sys = array();
  $sysQ = "SELECT fldEmployeeNum FROM emp_prof WHERE fldGroup='SYS' AND fldActive=1 AND fldEmployeeNum NOT IN (464,510,487,466)";
  $sysStmt = $connkdt->query($sysQ);
  $sysArr = $sysStmt->fetchAll();
  foreach ($sysArr as $syss) {
    array_push($sys, $syss['fldEmployeeNum']);
  }
  $itMembers = array();
  $itQ = "SELECT fldEmployeeNum FROM emp_prof WHERE fldGroup='IT' AND fldActive=1";
  $itStmt = $connkdt->query($itQ);
  $itArr = $itStmt->fetchAll();
  foreach ($itArr as $its) {
    array_push($itMembers, $its['fldEmployeeNum']);
  }
  $allAccess = array();
  $allAccess = array_merge($devs, $itMembers, $sys);
} catch (PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
