<?php 
$config = [
  'host' => 'localhost',
  'port' => 3306,
  'dbname' => 'kdtphdb',
  'charset' => 'utf8mb4',
  'port' => 3000
];
$username = 'dev';
$password = 'dev';
$dsn = 'mysql:' . http_build_query($config, '', ';');
try {
  $connkdt = new PDO($dsn, $username, $password,[
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]);
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
?>

