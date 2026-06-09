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
foreach ($path_parts as $part) {
    if ($part === 'toggle' || $part === 'check' || $part === 'list') {
        $action = $part;
        break;
    }
}

$herb_id = null;
if (isset($_GET['herb_id'])) {
    $herb_id = intval($_GET['herb_id']);
}

if ($method === 'POST' && $action === 'toggle') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "请先登录"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->herb_id) || !is_numeric($data->herb_id)) {
        http_response_code(400);
        echo json_encode(["message" => "缺少中药ID"]);
        exit;
    }

    $herb_id = intval($data->herb_id);
    $user_id = intval($_SESSION['user_id']);

    try {
        $checkQuery = "SELECT id FROM herb_favorites WHERE user_id = :user_id AND herb_id = :herb_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $checkStmt->bindParam(':herb_id', $herb_id, PDO::PARAM_INT);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            $deleteQuery = "DELETE FROM herb_favorites WHERE user_id = :user_id AND herb_id = :herb_id";
            $deleteStmt = $db->prepare($deleteQuery);
            $deleteStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $deleteStmt->bindParam(':herb_id', $herb_id, PDO::PARAM_INT);
            $deleteStmt->execute();

            echo json_encode(["favorited" => false, "message" => "已取消收藏"]);
        } else {
            $insertQuery = "INSERT INTO herb_favorites (user_id, herb_id) VALUES (:user_id, :herb_id)";
            $insertStmt = $db->prepare($insertQuery);
            $insertStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $insertStmt->bindParam(':herb_id', $herb_id, PDO::PARAM_INT);
            $insertStmt->execute();

            echo json_encode(["favorited" => true, "message" => "收藏成功"]);
        }
    } catch (PDOException $e) {
        Logger::error("Toggle favorite fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "操作失败"]);
    }
} elseif ($method === 'GET' && $action === 'check') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["favorited" => false]);
        exit;
    }

    if (!$herb_id) {
        http_response_code(400);
        echo json_encode(["message" => "缺少中药ID"]);
        exit;
    }

    $user_id = intval($_SESSION['user_id']);

    try {
        $query = "SELECT id FROM herb_favorites WHERE user_id = :user_id AND herb_id = :herb_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':herb_id', $herb_id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode(["favorited" => $stmt->rowCount() > 0]);
    } catch (PDOException $e) {
        Logger::error("Check favorite fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "查询失败"]);
    }
} elseif ($method === 'GET' && $action === 'list') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "请先登录"]);
        exit;
    }

    $user_id = intval($_SESSION['user_id']);
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $offset = ($page - 1) * $limit;

    try {
        $countQuery = "SELECT COUNT(*) as total FROM herb_favorites WHERE user_id = :user_id";
        $countStmt = $db->prepare($countQuery);
        $countStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $countStmt->execute();
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

        $query = "SELECT f.id as favorite_id, f.created_at as favorited_at,
                  h.id as herb_id, h.name, h.image, h.alias, 
                  LEFT(h.efficacy, 80) as efficacy, c.name as category_name
                  FROM herb_favorites f
                  INNER JOIN herbs h ON f.herb_id = h.id
                  LEFT JOIN categories c ON h.category_id = c.id
                  WHERE f.user_id = :user_id
                  ORDER BY f.created_at DESC
                  LIMIT :limit OFFSET :offset";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
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
        Logger::error("List favorites fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "获取收藏列表失败"]);
    }
} elseif ($method === 'DELETE') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "请先登录"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"));
    $user_id = intval($_SESSION['user_id']);

    $herb_id = null;
    if (isset($data->herb_id)) {
        $herb_id = intval($data->herb_id);
    } elseif (isset($_GET['herb_id'])) {
        $herb_id = intval($_GET['herb_id']);
    }

    if (!$herb_id) {
        http_response_code(400);
        echo json_encode(["message" => "缺少中药ID"]);
        exit;
    }

    try {
        $query = "DELETE FROM herb_favorites WHERE user_id = :user_id AND herb_id = :herb_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':herb_id', $herb_id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo json_encode(["message" => "已取消收藏"]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "收藏记录不存在"]);
        }
    } catch (PDOException $e) {
        Logger::error("Delete favorite fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "取消收藏失败"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method Not Allowed"]);
}
