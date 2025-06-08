<?php
// api/mainpage.php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

// Wenn eingeloggt, gib ein kleines Payload zurück
echo json_encode([
    "status" => "success",
    "user" => [
        "user_id" => $_SESSION['user_id'],
        "email"   => $_SESSION['email'],
        "name"    => $_SESSION['name'],
    ]
]);
?>
