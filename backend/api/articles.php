<?php
require_once '../config/database.php';
require_once '../utils/Logger.php';

session_start();
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$database = new Database();
$db = $database->getConnection();

// 解析URL ID
// URL如: /api/articles/123
$request_uri = $_SERVER['REQUEST_URI'];
$path_parts = explode('/', parse_url($request_uri, PHP_URL_PATH));
$id = null;
if (isset($path_parts[3]) && is_numeric($path_parts[3])) {
    $id = intval($path_parts[3]);
}

if ($method === 'GET') {
    if ($id) {
        // 获取详情 - 需要登录
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["message" => "请登录后查看详情"]);
            exit;
        }

        try {
            $query = "SELECT a.*, c.name as category_name, u.username as author_name 
                      FROM tcm_articles a 
                      LEFT JOIN categories c ON a.category_id = c.id 
                      LEFT JOIN users u ON a.author_id = u.id 
                      WHERE a.id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            $article = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($article) {
                echo json_encode($article);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "文章不存在"]);
            }
        } catch (PDOException $e) {
            Logger::error("Get article fail: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["message" => "获取文章失败"]);
        }
    } else {
        // 获取列表
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
        $offset = ($page - 1) * $limit;
        
        $category_id = isset($_GET['category_id']) ? intval($_GET['category_id']) : null;
        $keyword = isset($_GET['keyword']) ? $_GET['keyword'] : null;

        $query = "SELECT a.id, a.title, a.thumbnail, a.summary, a.source, a.created_at, c.name as category_name 
                  FROM tcm_articles a 
                  LEFT JOIN categories c ON a.category_id = c.id 
                  WHERE 1=1";
        $countQuery = "SELECT COUNT(*) as total FROM tcm_articles WHERE 1=1";
        $params = [];

        if ($category_id) {
            $query .= " AND category_id = :category_id";
            $countQuery .= " AND category_id = :category_id";
            $params[':category_id'] = $category_id;
        }

        if ($keyword) {
            $query .= " AND (title LIKE :keyword OR summary LIKE :keyword)";
            $countQuery .= " AND (title LIKE :keyword OR summary LIKE :keyword)";
            $params[':keyword'] = "%{$keyword}%";
        }

        $query .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";

        try {
            // Get Total
            $stmtCount = $db->prepare($countQuery);
            foreach ($params as $key => $val) {
                $stmtCount->bindValue($key, $val);
            }
            $stmtCount->execute();
            $total = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];

            // Get List
            $stmt = $db->prepare($query);
            foreach ($params as $key => $val) {
                $stmt->bindValue($key, $val);
            }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "total" => $total,
                "page" => $page,
                "limit" => $limit,
                "data" => $articles
            ]);
        } catch (PDOException $e) {
            Logger::error("Get articles fail: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["message" => "获取文章列表失败"]);
        }
    }
} elseif ($method === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "未登录"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->title) || !isset($data->content) || !isset($data->category_id)) {
        http_response_code(400);
        echo json_encode(["message" => "缺少必要字段"]);
        exit;
    }

    try {
        $query = "INSERT INTO tcm_articles (title, thumbnail, summary, content, source, category_id, author_id) 
                  VALUES (:title, :thumbnail, :summary, :content, :source, :category_id, :author_id)";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':title', $data->title);
        $stmt->bindParam(':thumbnail', $data->thumbnail);
        $stmt->bindParam(':summary', $data->summary);
        $stmt->bindParam(':content', $data->content);
        $stmt->bindParam(':source', $data->source);
        $stmt->bindParam(':category_id', $data->category_id);
        $stmt->bindParam(':author_id', $_SESSION['user_id']);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "文章发布成功", "id" => $db->lastInsertId()]);
        }
    } catch (PDOException $e) {
        Logger::error("Create article fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "文章发布失败"]);
    }
} elseif ($method === 'PUT') {
    if (!$id || !isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "未授权的操作"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"));
    
    try {
        $query = "UPDATE tcm_articles SET 
                  title = :title, 
                  thumbnail = :thumbnail, 
                  summary = :summary, 
                  content = :content, 
                  source = :source, 
                  category_id = :category_id 
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':title', $data->title);
        $stmt->bindParam(':thumbnail', $data->thumbnail);
        $stmt->bindParam(':summary', $data->summary);
        $stmt->bindParam(':content', $data->content);
        $stmt->bindParam(':source', $data->source);
        $stmt->bindParam(':category_id', $data->category_id);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            echo json_encode(["message" => "文章更新成功"]);
        }
    } catch (PDOException $e) {
        Logger::error("Update article fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "更新失败"]);
    }
} elseif ($method === 'DELETE') {
    if (!$id || !isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "未授权的操作"]);
        exit;
    }

    try {
        $query = "DELETE FROM tcm_articles WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) {
            echo json_encode(["message" => "文章删除成功"]);
        }
    } catch (PDOException $e) {
        Logger::error("Delete article fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "删除失败"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method Not Allowed"]);
}
