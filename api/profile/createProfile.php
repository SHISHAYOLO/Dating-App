<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

// DB-Verbindung
require_once '../../system/config.php';

// Logged-in user ID
$loggedInUserId = $_SESSION['user_id'];

// Read JSON input from fetch request
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($input['firstname']) || !isset($input['lastname'])) {
    http_response_code(400);
    echo json_encode(["error" => "Firstname and lastname are required."]);
    exit;
}

$firstname = trim($input['firstname']);
$lastname = trim($input['lastname']);

// Insert into DB
$stmt = $pdo->prepare("INSERT INTO user_profiles (user_id, firstname, lastname) VALUES (:user_id, :firstname, :lastname)");
$stmt->bindParam(':user_id', $loggedInUserId, PDO::PARAM_INT);
$stmt->bindParam(':firstname', $firstname, PDO::PARAM_STR);
$stmt->bindParam(':lastname', $lastname, PDO::PARAM_STR);

try {
    $stmt->execute();
    echo json_encode(["success" => true, "message" => "Profile created."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}



$input = json_decode(file_get_contents('php://input'), true);

// erwarte firstname, lastname, age, gender, biography
foreach (['firstname','lastname','age','gender','biography'] as $f) {
    if (!isset($input[$f])) {
        http_response_code(400);
        exit(json_encode(["error" => "$f ist erforderlich."]));
    }
}

$firstname = trim($input['firstname']);
$lastname  = trim($input['lastname']);
$age       = (int) $input['age'];
$gender    = trim($input['gender']);
$bio       = trim($input['biography']);

// einfache Validierung
if ($age < 18 || $age > 120) {
    http_response_code(400);
    exit(json_encode(["error" => "Alter muss zwischen 18 und 120 liegen."]));
}
if (!in_array($gender, ['m','w','d'], true)) {
    http_response_code(400);
    exit(json_encode(["error" => "Ungültiges Geschlecht."]));
}

$stmt = $pdo->prepare("
  INSERT INTO user_profiles
    (user_id, firstname, lastname, age, gender, biography)
  VALUES
    (:user_id, :firstname, :lastname, :age, :gender, :biography)
");
$stmt->execute([
    ':user_id'    => $loggedInUserId,
    ':firstname'  => $firstname,
    ':lastname'   => $lastname,
    ':age'        => $age,
    ':gender'     => $gender,
    ':biography'  => $bio,
]);

echo json_encode(["success" => true, "message" => "Profile created."]);
