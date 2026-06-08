<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);

// /api/generate
if (isset($uri[1]) && $uri[1] === 'api') {
    if (isset($uri[2])) {
        if ($uri[2] === 'generate') {
            require "../api/generate.php";
            exit();
        }
        if ($uri[2] === 'validate') {
            require "../api/validate.php";
            exit();
        }
         if ($uri[2] === 'cards') {
             require "../api/list_cards.php";
             exit();
        }
    }
}
echo json_encode(["message" => "Welcome to Card Generator API"]);
?>
