<?php
include_once '../config/database.php';
include_once '../utils/Random.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->type) && !empty($data->count)) {
    // Map type name to ID (Simplified logic, ideally should query DB)
    $type_id = 1; // Default Monthly
    if ($data->type === 'Xianyu') {
        $type_id = 2;
    }

    $count = intval($data->count);
    $generated_cards = [];
    
    $stmt = $db->prepare("INSERT INTO cards (code, type_id, status) VALUES (:code, :type_id, 'active')");
    
    for ($i = 0; $i < $count; $i++) {
        $code = Random::generateCode();
        $stmt->bindParam(":code", $code);
        $stmt->bindParam(":type_id", $type_id);
       
        if($stmt->execute()){
            $generated_cards[] = $code;
        }
    }

    if(count($generated_cards) > 0){
        http_response_code(201);
        echo json_encode(array("message" => "Cards generated.", "cards" => $generated_cards));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to generate cards."));
    }

} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data. Need type and count."));
}
?>
