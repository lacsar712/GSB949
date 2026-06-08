<?php
require_once '../config/database.php';
require_once '../utils/Logger.php';

session_start();
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : (isset($_SERVER['REDIRECT_URL']) ? str_replace('/api/auth.php', '', $_SERVER['REDIRECT_URL']) : '');

// Apache rewrite may pass path as /login, /register etc.
// Check .htaccess rules: ^api/auth/(.*)$ api/auth.php
// If we access /api/auth/login, the rewrite rule maps it to api/auth.php
// We need to parse the URL to determine the action.

$request_uri = $_SERVER['REQUEST_URI'];
$action = basename(parse_url($request_uri, PHP_URL_PATH));

$database = new Database();
$db = $database->getConnection();

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if ($action === 'register') {
        register($db, $data);
    } elseif ($action === 'login') {
        login($db, $data);
    } elseif ($action === 'logout') {
        logout();
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Not Found"]);
    }
} elseif ($method === 'GET') {
    if ($action === 'profile') {
        getProfile($db);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Not Found"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method Not Allowed"]);
}

function register($db, $data) {
    if (!isset($data->username) || !isset($data->email) || !isset($data->password) || !isset($data->address)) {
        http_response_code(400);
        echo json_encode(["message" => "缺少必要字段"]);
        return;
    }

    // 验证用户名首字母是否为字母
    if (!preg_match('/^[a-zA-Z]/', $data->username)) {
        http_response_code(400);
        echo json_encode(["message" => "用户名首字母必须为字母"]);
        return;
    }

    // 验证密码长度 6-8 位
    if (strlen($data->password) < 6 || strlen($data->password) > 8) {
        http_response_code(400);
        echo json_encode(["message" => "密码长度必须在6-8位之间"]);
        return;
    }
    
    // 验证两次密码是否一致 (前端由于已做校验, 后端主要校验字段完整性, 这里假设前端传参包含 confirm_password 用于业务逻辑校验, 
    // 但通常API只需一个password即可，业务层逻辑应确保一致性，这里再次校验更安全)
    if (isset($data->confirm_password) && $data->password !== $data->confirm_password) {
        http_response_code(400);
        echo json_encode(["message" => "两次密码输入不一致"]);
        return;
    }

    // 验证邮箱格式
    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
         http_response_code(400);
         echo json_encode(["message" => "邮箱格式不正确"]);
         return;
    }

    try {
        $query = "INSERT INTO users (username, email, password, address) VALUES (:username, :email, :password, :address)";
        $stmt = $db->prepare($query);

        $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

        $stmt->bindParam(":username", $data->username);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":password", $password_hash);
        $stmt->bindParam(":address", $data->address);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "注册成功"]);
        }
    } catch (PDOException $e) {
        Logger::error("Registration fail: " . $e->getMessage());
        if ($e->getCode() == 23000) { // Duplicate entry
            http_response_code(409);
            echo json_encode(["message" => "用户名或邮箱已存在"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "注册失败"]);
        }
    }
}

function login($db, $data) {
    if (!isset($data->username) || !isset($data->password)) {
        http_response_code(400);
        echo json_encode(["message" => "缺少用户名或密码"]);
        return;
    }

    try {
        $query = "SELECT id, username, password, role FROM users WHERE username = :username";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":username", $data->username);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($data->password, $row['password'])) {
                $_SESSION['user_id'] = $row['id'];
                $_SESSION['username'] = $row['username'];
                $_SESSION['role'] = $row['role'];

                echo json_encode([
                    "message" => "登录成功",
                    "user" => [
                        "id" => $row['id'],
                        "username" => $row['username'],
                        "role" => $row['role']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["message" => "无效的用户名或密码"]);
            }
        } else {
            http_response_code(401);
            echo json_encode(["message" => "无效的用户名或密码"]);
        }
    } catch (PDOException $e) {
        Logger::error("Login fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "登录失败"]);
    }
}

function logout() {
    session_unset();
    session_destroy();
    echo json_encode(["message" => "退出登录成功"]);
}

function getProfile($db) {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "未登录"]);
        return;
    }

    try {
        $query = "SELECT id, username, email, address, role, created_at FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $_SESSION['user_id']);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["user" => $user]);
    } catch (PDOException $e) {
        Logger::error("Get profile fail: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "获取用户信息失败"]);
    }
}
