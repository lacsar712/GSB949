<?php
require_once '../config/database.php';
require_once '../utils/Logger.php';

session_start();
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(["message" => "Method Not Allowed"]);
    exit;
}

$keyword = isset($_GET['keyword']) ? $_GET['keyword'] : '';
if (strlen($keyword) < 1) {
    echo json_encode(["articles" => [], "herbs" => []]);
    exit;
}

$database = new Database();
$db = $database->getConnection();
$searchTerm = "%{$keyword}%";

try {
    // 搜索文章
    $articleQuery = "SELECT id, title, thumbnail, summary, created_at FROM tcm_articles WHERE title LIKE :keyword OR summary LIKE :keyword LIMIT 5";
    $stmtA = $db->prepare($articleQuery);
    $stmtA->bindParam(':keyword', $searchTerm);
    $stmtA->execute();
    $articles = $stmtA->fetchAll(PDO::FETCH_ASSOC);

    // 搜索中药
    $herbQuery = "SELECT id, name, image, efficacy FROM herbs WHERE name LIKE :keyword OR alias LIKE :keyword OR efficacy LIKE :keyword LIMIT 5";
    $stmtH = $db->prepare($herbQuery);
    $stmtH->bindParam(':keyword', $searchTerm);
    $stmtH->execute();
    $herbs = $stmtH->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "articles" => $articles,
        "herbs" => $herbs
    ]);
} catch (PDOException $e) {
    Logger::error("Search fail: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "搜索失败"]);
}
