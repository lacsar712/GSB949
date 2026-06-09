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
$id = null;
if (isset($path_parts[3]) && is_numeric($path_parts[3])) {
    $id = intval($path_parts[3]);
}

if ($method === 'GET') {
    if (isset($_GET['check'])) {
        checkFavoriteStatus($db);
    } else {
        getFavorites($db);
    }
} elseif ($method === 'POST') {
    addFavorite($db);
} elseif ($method === 'DELETE') {
    removeFavorite($db, $id);
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method Not Allowed"]);
}

function checkFavoriteStatus($db) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["favorites" => []]);
        return;
    }

    $herb_ids = isset($_GET['herb_ids']) ? $_GET['herb_ids'] : '';
    if (empty($herb_ids)) {
        $single_id = isset($_GET['herb_id']) ? intval($_GET['herb_id']) : null;
        if ($single_id) {
            $herb_ids = strval($single_id);
        } else {
            echo json_encode(["favorites" => []]);
            return;
        }
    }

    $ids = array_filter(explode(',', $herb_ids), 'is_numeric');
    if (empty($ids)) {
        echo json_encode(["favorites" => []]);
        return;
    }

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    try {
        $query = "SELECT herb_id FROM user_favorites WHERE user_id = ? AND herb_id IN ($placeholders)";
        $stmt = $db->prepare($query);
        $params = array_merge([$_SESSION['user_id']], $ids);
        $stmt->execute($params);
        $favorites = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
        echo json_encode(["favorites" => array_map('intval', $favorites)]);
    } catch (PDOException $e) {
        Logger::error("Check favorite status fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "检查收藏状态失败"]);
    }
}

function getFavorites($db) {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "请先登录"]);
        return;
    }

    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 12;
    $offset = ($page - 1) * $limit;

    try {
        $countQuery = "SELECT COUNT(*) as total FROM user_favorites WHERE user_id = :user_id";
        $stmtCount = $db->prepare($countQuery);
        $stmtCount->bindParam(':user_id', $_SESSION['user_id']);
        $stmtCount->execute();
        $total = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];

        $query = "SELECT uf.id as favorite_id, uf.created_at, h.id, h.name, h.alias, h.image, 
                         LEFT(h.efficacy, 80) as efficacy, c.name as category_name 
                  FROM user_favorites uf 
                  INNER JOIN herbs h ON uf.herb_id = h.id 
                  LEFT JOIN categories c ON h.category_id = c.id 
                  WHERE uf.user_id = :user_id 
                  ORDER BY uf.created_at DESC 
                  LIMIT :limit OFFSET :offset";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "total" => intval($total),
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

function addFavorite($db) {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "请先登录"]);
        return;
    }

    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->herb_id)) {
        http_response_code(400);
        echo json_encode(["message" => "缺少中药ID"]);
        return;
    }

    $herb_id = intval($data->herb_id);
    
    try {
        $checkQuery = "SELECT id FROM herbs WHERE id = :id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':id', $herb_id);
        $checkStmt->execute();
        if ($checkStmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["message" => "中药不存在"]);
            return;
        }

        $checkExist = "SELECT id FROM user_favorites WHERE user_id = :user_id AND herb_id = :herb_id";
        $existStmt = $db->prepare($checkExist);
        $existStmt->bindParam(':user_id', $_SESSION['user_id']);
        $existStmt->bindParam(':herb_id', $herb_id);
        $existStmt->execute();
        if ($existStmt->rowCount() > 0) {
            echo json_encode(["message" => "已收藏过该中药"]);
            return;
        }

        $query = "INSERT INTO user_favorites (user_id, herb_id) VALUES (:user_id, :herb_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
        $stmt->bindParam(':herb_id', $herb_id);
        $stmt->execute();

        http_response_code(201);
        echo json_encode(["message" => "收藏成功"]);
    } catch (PDOException $e) {
        Logger::error("Add favorite fail: " . $e->getMessage());
        if ($e->getCode() == 23000) {
            echo json_encode(["message" => "已收藏过该中药"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "收藏失败"]);
        }
    }
}

function removeFavorite($db, $herb_id) {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "请先登录"]);
        return;
    }

    if (!$herb_id) {
        $data = json_decode(file_get_contents("php://input"));
        if (isset($data->herb_id)) {
            $herb_id = intval($data->herb_id);
        }
    }

    if (!$herb_id) {
        http_response_code(400);
        echo json_encode(["message" => "缺少中药ID"]);
        return;
    }

    try {
        $query = "DELETE FROM user_favorites WHERE user_id = :user_id AND herb_id = :herb_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
        $stmt->bindParam(':herb_id', $herb_id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo json_encode(["message" => "取消收藏成功"]);
        } else {
            echo json_encode(["message" => "未收藏该中药"]);
        }
    } catch (PDOException $e) {
        Logger::error("Remove favorite fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "取消收藏失败"]);
    }
}
