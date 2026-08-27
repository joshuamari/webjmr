<?php

/**
 * Build a cache-busted asset URL using the file's last modified time.
 * Example: js/newmain.js → js/newmain.js?v=20260827143015
 */
function asset_url(string $relativePath): string
{
    $baseDir = dirname(__DIR__); // JMC/
    $fullPath = $baseDir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativePath);
    $realPath = realpath($fullPath);

    if ($realPath === false || !is_file($realPath)) {
        return htmlspecialchars($relativePath, ENT_QUOTES, 'UTF-8');
    }

    $version = date('YmdHis', filemtime($realPath));

    return htmlspecialchars($relativePath, ENT_QUOTES, 'UTF-8') . '?v=' . $version;
}
