<?php
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->code)) {
    $query = "SELECT status FROM cards WHERE code = :code LIMIT 0,1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":code", $data->code);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode(array("valid" => true, "status" => $row['status']));
    } else {
        http_response_code(404);
        echo json_encode(array("valid" => false, "message" => "Card not found."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data. Need code."));
}
?>
