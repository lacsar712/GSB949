<?php
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$query = "SELECT c.id, c.code, c.status, c.created_at, t.name as type_name, t.price FROM cards c LEFT JOIN card_types t ON c.type_id = t.id ORDER BY c.created_at DESC";

$stmt = $db->prepare($query);
$stmt->execute();
$num = $stmt->rowCount();

if($num > 0){
    $cards_arr = array();
    $cards_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        extract($row);
        $card_item = array(
            "id" => $id,
            "code" => $code,
            "type_name" => $type_name,
            "price" => $price,
            "status" => $status,
            "created_at" => $created_at
        );
        array_push($cards_arr["records"], $card_item);
    }
    http_response_code(200);
    echo json_encode($cards_arr);
} else {
    http_response_code(200);
    echo json_encode(array("records" => []));
}
?>
