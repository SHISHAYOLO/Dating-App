<?php
// api/getRandomProfile.php
session_start();
header('Content-Type: application/json');
require_once '../system/config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}
$me = (int)$_SESSION['user_id'];

// Wähle zufällig ein Profil, das nicht man selbst ist und noch nicht geliked wurde
$sql = "
  SELECT p.user_id, p.name, p.age, p.gender, p.biography
    FROM user_profiles p
    LEFT JOIN user_matches m
      ON m.user_id = :me AND m.matched_user_id = p.user_id
   WHERE p.user_id != :me
     AND m.matched_user_id IS NULL
   ORDER BY RAND()
   LIMIT 1
";
$stmt = $pdo->prepare($sql);
$stmt->execute([':me' => $me]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    // Keine weiteren Profile
    http_response_code(204);
    exit;
}

echo json_encode(["user" => $user]);

