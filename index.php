<?php
/**
 * Caffeine Academic OS - Universal Root Entry Point for cPanel
 * Allows the application to run out-of-the-box simply by uploading & extracting.
 */

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH);

// 1. If request is for an API route, forward directly to the PHP API engine
if (preg_match('#^/api(/.*)?$#i', $path)) {
    if (file_exists(__DIR__ . '/api/index.php')) {
        require __DIR__ . '/api/index.php';
        exit;
    } elseif (file_exists(__DIR__ . '/public/api/index.php')) {
        require __DIR__ . '/public/api/index.php';
        exit;
    } elseif (file_exists(__DIR__ . '/dist/api/index.php')) {
        require __DIR__ . '/dist/api/index.php';
        exit;
    }
}

// 2. Serve index.html (the SPA single-page application)
$htmlPath = __DIR__ . '/index.html';
if (!file_exists($htmlPath) && file_exists(__DIR__ . '/dist/index.html')) {
    $htmlPath = __DIR__ . '/dist/index.html';
}

if (file_exists($htmlPath)) {
    header('Content-Type: text/html; charset=UTF-8');
    header('X-Frame-Options: SAMEORIGIN');
    header('X-Content-Type-Options: nosniff');
    readfile($htmlPath);
    exit;
}

// Emergency fallback
header('Content-Type: text/html; charset=UTF-8');
echo '<h1>Caffeine Academic OS</h1><p>پروژه با موفقیت روی هاست بارگذاری شده است.</p>';
