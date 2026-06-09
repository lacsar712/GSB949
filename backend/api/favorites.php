<?php
require_once '../config/database.php';
require_once '../utils/Logger.php';

session_start();
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$database = new Database();
$db = $database->getConnection();

$request_uri = $_SERVER['REQUEST_URI'];
$path_parts = explode('/', parse_url($request_uri, PHP_URL_PATH));

$action = null;
$herb_id = null;

if (isset($path_parts[3]) && $path_parts[3] === 'check' && isset($path_parts[4]) && is_numeric($path_parts[4])) {
    $action = 'check';
    $herb_id = intval($path_parts[4]);
} elseif (isset($path_parts[3]) && is_numeric($path_parts[3])) {
    $herb_id = intval($path_parts[3]);
}

if ($method === 'POST') {
    addFavorite($db);
} elseif ($method === 'DELETE') {
    if ($herb_id) {
        removeFavorite($db, $herb_id);
    } else {
        http_response_code(400);
        echo json_encode(["message" => "缺少中药ID"]);
    }
} elseif ($method === 'GET') {
    if ($action === 'check' && $herb_id) {
        checkFavorite($db, $herb_id);
    } else {
        getFavorites($db);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method Not Allowed"]);
}

function addFavorite($db) {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "未登录"]);
        return;
    }

    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->herb_id) || !is_numeric($data->herb_id)) {
        http_response_code(400);
        echo json_encode(["message" => "缺少中药ID"]);
        return;
    }

    $herb_id = intval($data->herb_id);
    $user_id = $_SESSION['user_id'];

    try {
        $checkQuery = "SELECT id FROM herbs WHERE id = :herb_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':herb_id', $herb_id);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["message" => "中药不存在"]);
            return;
        }

        $query = "INSERT INTO herb_favorites (user_id, herb_id) VALUES (:user_id, :herb_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':herb_id', $herb_id);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "收藏成功"]);
        }
    } catch (PDOException $e) {
        Logger::error("Add favorite fail: " . $e->getMessage());
        if ($e->getCode() == 23000) {
            http_response_code(409);
            echo json_encode(["message" => "已收藏该中药"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "收藏失败"]);
        }
    }
}

function removeFavorite($db, $herb_id) {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "未登录"]);
        return;
    }

    $user_id = $_SESSION['user_id'];

    try {
        $query = "DELETE FROM herb_favorites WHERE user_id = :user_id AND herb_id = :herb_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':herb_id', $herb_id);

        if ($stmt->execute()) {
            if ($stmt->rowCount() > 0) {
                echo json_encode(["message" => "取消收藏成功"]);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "未收藏该中药"]);
            }
        }
    } catch (PDOException $e) {
        Logger::error("Remove favorite fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "取消收藏失败"]);
    }
}

function checkFavorite($db, $herb_id) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["is_favorited" => false]);
        return;
    }

    $user_id = $_SESSION['user_id'];

    try {
        $query = "SELECT id FROM herb_favorites WHERE user_id = :user_id AND herb_id = :herb_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':herb_id', $herb_id);
        $stmt->execute();

        $is_favorited = $stmt->rowCount() > 0;
        echo json_encode(["is_favorited" => $is_favorited]);
    } catch (PDOException $e) {
        Logger::error("Check favorite fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "检查收藏状态失败"]);
    }
}

function getFavorites($db) {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "未登录"]);
        return;
    }

    $user_id = $_SESSION['user_id'];
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $offset = ($page - 1) * $limit;

    try {
        $countQuery = "SELECT COUNT(*) as total FROM herb_favorites WHERE user_id = :user_id";
        $stmtCount = $db->prepare($countQuery);
        $stmtCount->bindParam(':user_id', $user_id);
        $stmtCount->execute();
        $total = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];

        $query = "SELECT h.id, h.name, h.image, left(h.efficacy, 50) as efficacy, c.name as category_name, f.created_at as favorited_at
                  FROM herb_favorites f
                  LEFT JOIN herbs h ON f.herb_id = h.id
                  LEFT JOIN categories c ON h.category_id = c.id
                  WHERE f.user_id = :user_id
                  ORDER BY f.created_at DESC
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "total" => $total,
            "page" => $page,
            "limit" => $limit,
            "data" => $favorites
        ]);
    } catch (PDOException $e) {
        Logger::error("Get favorites list fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "获取收藏列表失败"]);
    }
}
