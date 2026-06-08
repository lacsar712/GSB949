<?php
require_once '../config/database.php';
require_once '../utils/Logger.php';

session_start();
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$database = new Database();
$db = $database->getConnection();

if ($method === 'GET') {
    $type = isset($_GET['type']) ? $_GET['type'] : null;
    $query = "SELECT * FROM categories";
    if ($type) {
        $query .= " WHERE type = :type";
    }
    $query .= " ORDER BY id ASC";
    
    try {
        $stmt = $db->prepare($query);
        if ($type) {
            $stmt->bindParam(':type', $type);
        }
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($categories);
    } catch (PDOException $e) {
        Logger::error("Get categories fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "获取分类失败"]);
    }
} elseif ($method === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "未登录"]);
        exit;
    }
    
    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->name) || !isset($data->type)) {
        http_response_code(400);
        echo json_encode(["message" => "缺少分类名称或类型"]);
        exit;
    }

    try {
        $query = "INSERT INTO categories (name, type) VALUES (:name, :type)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $data->name);
        $stmt->bindParam(':type', $data->type);
        
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "分类添加成功", "id" => $db->lastInsertId()]);
        }
    } catch (PDOException $e) {
        Logger::error("Create category fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "添加分类失败"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method Not Allowed"]);
}
