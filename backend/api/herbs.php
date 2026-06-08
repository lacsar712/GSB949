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
# Adjust index if URI structure is different, generally /api/herbs/{id}
if (isset($path_parts[3]) && is_numeric($path_parts[3])) {
    $id = intval($path_parts[3]);
}

if ($method === 'GET') {
    if ($id) {
        try {
            $query = "SELECT h.*, c.name as category_name 
                      FROM herbs h 
                      LEFT JOIN categories c ON h.category_id = c.id 
                      WHERE h.id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $herb = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($herb) {
                echo json_encode($herb);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "中药不存在"]);
            }
        } catch (PDOException $e) {
            Logger::error("Get herb fail: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["message" => "此中药无法获取"]);
        }
    } else {
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
        $offset = ($page - 1) * $limit;
        $keyword = isset($_GET['keyword']) ? $_GET['keyword'] : null;

        $query = "SELECT h.id, h.name, h.image, left(h.efficacy, 50) as efficacy, c.name as category_name 
                  FROM herbs h 
                  LEFT JOIN categories c ON h.category_id = c.id 
                  WHERE 1=1";
        $countQuery = "SELECT COUNT(*) as total FROM herbs WHERE 1=1";
        $params = [];

        if ($keyword) {
            $query .= " AND (h.name LIKE :keyword OR h.alias LIKE :keyword OR h.efficacy LIKE :keyword OR h.summary LIKE :keyword)";
            $countQuery .= " AND (name LIKE :keyword OR alias LIKE :keyword OR efficacy LIKE :keyword OR summary LIKE :keyword)";
            $params[':keyword'] = "%{$keyword}%";
        }

        $query .= " ORDER BY id ASC LIMIT :limit OFFSET :offset";

        try {
            $stmtCount = $db->prepare($countQuery);
            foreach ($params as $key => $val) {
                $stmtCount->bindValue($key, $val);
            }
            $stmtCount->execute();
            $total = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];

            $stmt = $db->prepare($query);
            foreach ($params as $key => $val) {
                $stmt->bindValue($key, $val);
            }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $herbs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "total" => $total,
                "page" => $page,
                "limit" => $limit,
                "data" => $herbs
            ]);
        } catch (PDOException $e) {
             Logger::error("Get herbs list fail: " . $e->getMessage());
             http_response_code(500);
             echo json_encode(["message" => "获取中药列表失败"]);
        }
    }
} elseif ($method === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "未登录"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"));
    
    try {
        $query = "INSERT INTO herbs (name, alias, image, summary, source, efficacy, pharmacology, category_id) 
                  VALUES (:name, :alias, :image, :summary, :source, :efficacy, :pharmacology, :category_id)";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':name', $data->name);
        $stmt->bindParam(':alias', $data->alias);
        $stmt->bindParam(':image', $data->image);
        $stmt->bindParam(':summary', $data->summary);
        $stmt->bindParam(':source', $data->source);
        $stmt->bindParam(':efficacy', $data->efficacy);
        $stmt->bindParam(':pharmacology', $data->pharmacology);
        $stmt->bindParam(':category_id', $data->category_id);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "中药录入成功", "id" => $db->lastInsertId()]);
        }
    } catch (PDOException $e) {
        Logger::error("Create herb fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "中药录入失败"]);
    }
} elseif ($method === 'PUT') {
    if (!$id || !isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "未授权"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"));
    try {
        $query = "UPDATE herbs SET 
                  name = :name, 
                  alias = :alias, 
                  image = :image, 
                  summary = :summary, 
                  source = :source, 
                  efficacy = :efficacy, 
                  pharmacology = :pharmacology, 
                  category_id = :category_id 
                  WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $data->name);
        $stmt->bindParam(':alias', $data->alias);
        $stmt->bindParam(':image', $data->image);
        $stmt->bindParam(':summary', $data->summary);
        $stmt->bindParam(':source', $data->source);
        $stmt->bindParam(':efficacy', $data->efficacy);
        $stmt->bindParam(':pharmacology', $data->pharmacology);
        $stmt->bindParam(':category_id', $data->category_id);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
             echo json_encode(["message" => "更新成功"]);
        }
    } catch (PDOException $e) {
        Logger::error("Update herb fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "更新失败"]);
    }
} elseif ($method === 'DELETE') {
    if (!$id || !isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "未授权"]);
        exit;
    }
    try {
        $query = "DELETE FROM herbs WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) {
            echo json_encode(["message" => "删除成功"]);
        }
    } catch (PDOException $e) {
        Logger::error("Delete herb fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "删除失败"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method Not Allowed"]);
}
