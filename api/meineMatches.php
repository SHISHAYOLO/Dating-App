<?php
// api/meineMatches.php
session_start();
header('Content-Type: application/json');
require_once '../system/config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$me = (int)$_SESSION['user_id'];

// Nur gegenseitige Matches (beide haben sich geliked)
$sql = "
    SELECT p.user_id, p.name, p.age, p.gender, p.biography
      FROM user_profiles p
      INNER JOIN user_matches m1 ON m1.matched_user_id = p.user_id AND m1.user_id = :me
      INNER JOIN user_matches m2 ON m2.user_id = p.user_id AND m2.matched_user_id = :me
";
$stmt = $pdo->prepare($sql);
$stmt->execute([':me' => $me]);
$matches = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($matches);
