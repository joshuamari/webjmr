<?php
$config = [
    'host' => 'localhost',
    'port' => 3306,
    'dbname' => 'pc_login',
    'charset' => 'utf8mb4'
];
$username = 'kdt';
$password = 'none';
$dsn = 'mysql:' . http_build_query($config, '', ';');
try {
    $connams = new PDO($dsn, $username, $password, [
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $solProjID = $solProjStmt->fetchColumn();
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
