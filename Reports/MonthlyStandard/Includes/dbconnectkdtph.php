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
  $gods = ['464', '487'];
  $itMembers = array();
  $itQ = "SELECT fldEmployeeNum FROM emp_prof WHERE fldGroup='IT' AND fldActive=1";
  $itStmt = $connkdt->query($itQ);
  $itArr = $itStmt->fetchAll();
  foreach ($itArr as $its) {
    array_push($itMembers, $its['fldEmployeeNum']);
  }
  $mgaSM = array();
  $smQ = "SELECT fldEmployeeNum FROM emp_prof WHERE fldDesig IN ('SM','KDTP') AND fldActive=1";
  $smStmt = $connkdt->query($smQ);
  $smArr = $smStmt->fetchAll();
  foreach ($smArr as $sms) {
    array_push($mgaSM, $sms['fldEmployeeNum']);
  }
  $mgaACT = array();
  $actQ = "SELECT fldEmployeeNum FROM emp_prof WHERE fldGroup IN ('ACT') AND fldActive=1";
  $actStmt = $connkdt->query($actQ);
  $actArr = $actStmt->fetchAll();
  foreach ($actArr as $acts) {
    array_push($mgaACT, $acts['fldEmployeeNum']);
  }
  $mgaADM = array();
  $admQ = "SELECT fldEmployeeNum FROM emp_prof WHERE fldGroup IN ('ADM') AND fldActive=1";
  $admStmt = $connkdt->query($admQ);
  $admArr = $admStmt->fetchAll();
  foreach ($admArr as $adms) {
    array_push($mgaADM, $adms['fldEmployeeNum']);
  }
  $reportAllGroupAccess = [];
  $reportAllGroupAccess = array_merge($gods, $itMembers, $mgaSM, $mgaACT, $mgaADM);
} catch (PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
