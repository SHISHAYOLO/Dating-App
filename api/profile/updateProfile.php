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
if (!isset($input['age'])) {
    http_response_code(400);
    echo json_encode(["error" => "Wir brauchen dein Alter."]);
    exit;
}

$age = $input['age'];


// Update the user's profile in the database
$stmt = $pdo->prepare("UPDATE user_profiles SET age = :age WHERE user_id = :user_id");
$stmt->bindParam(':age', $age, PDO::PARAM_STR);
$stmt->bindParam(':user_id', $loggedInUserId, PDO::PARAM_INT);


try {
    $stmt->execute();
    echo json_encode(["success" => true, "message" => "Profile updated."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}

// … session- und config-Handling unverändert …

$input = json_decode(file_get_contents('php://input'), true);
$fields = [];
$params = [':user_id' => $loggedInUserId];

// mögliche Felder
if (isset($input['age'])) {
    $age = (int) $input['age'];
    if ($age < 18 || $age > 120) {
        http_response_code(400);
        exit(json_encode(["error" => "Alter muss zwischen 18 und 120 liegen."]));
    }
    $fields[]   = "age = :age";
    $params[':age'] = $age;
}

if (isset($input['name'])) {
    $name = trim($input['name']);
    if (empty($name)) {
        http_response_code(400);
        exit(json_encode(["error" => "Name darf nicht leer sein."]));
    }
    $fields[]      = "name = :name";
    $params[':name'] = $name;
}

if (isset($input['gender'])) {
    $gender = trim($input['gender']);
    if (!in_array($gender, ['m','w','d'], true)) {
        http_response_code(400);
        exit(json_encode(["error" => "Ungültiges Geschlecht."]));
    }
    $fields[]      = "gender = :gender";
    $params[':gender'] = $gender;
}
if (isset($input['biography'])) {
    $fields[]         = "biography = :biography";
    $params[':biography'] = trim($input['biography']);
}
// ggf. auch firstname/lastname/geburtsjahr hier hinzufügen …

if (empty($fields)) {
    http_response_code(400);
    exit(json_encode(["error" => "Keine Felder zum Aktualisieren angegeben."]));
}

$sql = "UPDATE user_profiles SET " . implode(", ", $fields) . " WHERE user_id = :user_id";

$stmt = $pdo->prepare($sql);
try {
    $stmt->execute($params);
    echo json_encode(["success" => true, "message" => "Profile updated."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
