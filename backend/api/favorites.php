<?php
require_once '../config/database.php';
require_once '../utils/Logger.php';

session_start();
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$database = new Database();
$db = $database->getConnection();

// 解析路径，支持以下：
// GET    /api/favorites           -> 当前用户收藏列表（分页）
// GET    /api/favorites/check?herb_id=xx -> 查询是否已收藏
// POST   /api/favorites           -> 新增收藏 {herb_id}
// DELETE /api/favorites/{herb_id} -> 取消收藏
$request_uri = $_SERVER['REQUEST_URI'];
$path_parts = explode('/', parse_url($request_uri, PHP_URL_PATH));

$sub_action = isset($path_parts[3]) ? $path_parts[3] : '';
$path_id = null;
if (is_numeric($sub_action)) {
    $path_id = intval($sub_action);
    $sub_action = '';
}

// 鉴权检查
function requireLogin() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "请先登录"]);
        exit;
    }
    return intval($_SESSION['user_id']);
}

if ($method === 'GET' && $sub_action === 'check') {
    // 查询某个中药是否被当前用户收藏
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["favorited" => false]);
        exit;
    }
    $user_id = intval($_SESSION['user_id']);
    $herb_id = isset($_GET['herb_id']) ? intval($_GET['herb_id']) : 0;
    if ($herb_id <= 0) {
        http_response_code(400);
        echo json_encode(["message" => "缺少 herb_id"]);
        exit;
    }
    try {
        $query = "SELECT id FROM herb_favorites WHERE user_id = :uid AND herb_id = :hid LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindValue(':uid', $user_id, PDO::PARAM_INT);
        $stmt->bindValue(':hid', $herb_id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["favorited" => $row ? true : false]);
    } catch (PDOException $e) {
        Logger::error("Check favorite fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "查询收藏状态失败"]);
    }
    exit;
}

if ($method === 'GET') {
    // 收藏列表（分页）
    $user_id = requireLogin();
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, min(50, intval($_GET['limit']))) : 10;
    $offset = ($page - 1) * $limit;

    try {
        $countQuery = "SELECT COUNT(*) AS total FROM herb_favorites WHERE user_id = :uid";
        $stmtC = $db->prepare($countQuery);
        $stmtC->bindValue(':uid', $user_id, PDO::PARAM_INT);
        $stmtC->execute();
        $total = intval($stmtC->fetch(PDO::FETCH_ASSOC)['total']);

        $query = "SELECT f.id AS favorite_id, f.created_at AS favorited_at,
                         h.id, h.name, h.image, LEFT(h.efficacy, 80) AS efficacy,
                         c.name AS category_name
                  FROM herb_favorites f
                  INNER JOIN herbs h ON f.herb_id = h.id
                  LEFT JOIN categories c ON h.category_id = c.id
                  WHERE f.user_id = :uid
                  ORDER BY f.created_at DESC, f.id DESC
                  LIMIT :limit OFFSET :offset";
        $stmt = $db->prepare($query);
        $stmt->bindValue(':uid', $user_id, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $list = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "total" => $total,
            "page" => $page,
            "limit" => $limit,
            "data" => $list
        ]);
    } catch (PDOException $e) {
        Logger::error("List favorites fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "获取收藏列表失败"]);
    }
    exit;
}

if ($method === 'POST') {
    $user_id = requireLogin();
    $data = json_decode(file_get_contents("php://input"));
    $herb_id = isset($data->herb_id) ? intval($data->herb_id) : 0;
    if ($herb_id <= 0) {
        http_response_code(400);
        echo json_encode(["message" => "缺少 herb_id"]);
        exit;
    }

    try {
        // 校验中药存在
        $checkHerb = $db->prepare("SELECT id FROM herbs WHERE id = :hid");
        $checkHerb->bindValue(':hid', $herb_id, PDO::PARAM_INT);
        $checkHerb->execute();
        if (!$checkHerb->fetch(PDO::FETCH_ASSOC)) {
            http_response_code(404);
            echo json_encode(["message" => "中药不存在"]);
            exit;
        }

        $insert = $db->prepare("INSERT INTO herb_favorites (user_id, herb_id) VALUES (:uid, :hid)");
        $insert->bindValue(':uid', $user_id, PDO::PARAM_INT);
        $insert->bindValue(':hid', $herb_id, PDO::PARAM_INT);
        $insert->execute();
        http_response_code(201);
        echo json_encode(["message" => "收藏成功", "favorited" => true]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            // 唯一索引冲突，已收藏
            http_response_code(409);
            echo json_encode(["message" => "您已收藏过该中药", "favorited" => true]);
        } else {
            Logger::error("Add favorite fail: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["message" => "收藏失败"]);
        }
    }
    exit;
}

if ($method === 'DELETE') {
    $user_id = requireLogin();
    $herb_id = $path_id;
    if (!$herb_id) {
        // 也支持从 body 中读取
        $data = json_decode(file_get_contents("php://input"));
        $herb_id = isset($data->herb_id) ? intval($data->herb_id) : 0;
    }
    if (!$herb_id || $herb_id <= 0) {
        http_response_code(400);
        echo json_encode(["message" => "缺少 herb_id"]);
        exit;
    }
    try {
        $stmt = $db->prepare("DELETE FROM herb_favorites WHERE user_id = :uid AND herb_id = :hid");
        $stmt->bindValue(':uid', $user_id, PDO::PARAM_INT);
        $stmt->bindValue(':hid', $herb_id, PDO::PARAM_INT);
        $stmt->execute();
        if ($stmt->rowCount() > 0) {
            echo json_encode(["message" => "已取消收藏", "favorited" => false]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "收藏记录不存在"]);
        }
    } catch (PDOException $e) {
        Logger::error("Delete favorite fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "取消收藏失败"]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["message" => "Method Not Allowed"]);
