<?php
// api/likeMatch.php
session_start();
header('Content-Type: application/json');
require_once '../system/config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}
$me = (int)$_SESSION['user_id'];

// JSON einlesen
$input = json_decode(file_get_contents('php://input'), true);
$other = isset($input['matched_user_id']) ? (int)$input['matched_user_id'] : 0;

if (!$other) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Kein Profil angegeben"]);
    exit;
}

// Doppelte Likes verhindern
$stmt = $pdo->prepare("
  SELECT 1 FROM user_matches 
   WHERE user_id = :me AND matched_user_id = :other
");
$stmt->execute([':me' => $me, ':other' => $other]);
if ($stmt->fetch()) {
    echo json_encode(["status" => "success", "message" => "Bereits geliked"]);
    exit;
}

// Like speichern
$stmt = $pdo->prepare("
  INSERT INTO user_matches (user_id, matched_user_id)
  VALUES (:me, :other)
");
try {
    $stmt->execute([':me' => $me, ':other' => $other]);
    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Datenbankfehler"]);
}
