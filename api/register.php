<?php
// api/register.php
session_start();
header('Content-Type: application/json');
require_once '../system/config.php';

// Nur POST zulassen
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Methode nicht erlaubt"]);
    exit;
}

// Felder einlesen (x-www-form-urlencoded)
$name      = trim($_POST['name']      ?? '');
$email     = trim($_POST['email']     ?? '');
$password  = trim($_POST['password']  ?? '');
$age       = trim($_POST['age']       ?? '');
$gender    = trim($_POST['gender']    ?? '');
$biography = trim($_POST['biography'] ?? '');

// Pflichtfelder prüfen
if (!$name || !$email || !$password || !$age || !$gender || !$biography) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Alle Felder sind erforderlich."]);
    exit;
}

// Server-Side Validierung
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Ungültige E-Mail-Adresse."]);
    exit;
}
if (!ctype_digit($age) || (int)$age < 18 || (int)$age > 120) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Alter muss eine Zahl zwischen 18 und 120 sein."]);
    exit;
}
$allowedGenders = ['m','w','d'];
if (!in_array($gender, $allowedGenders, true)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Ungültiges Geschlecht."]);
    exit;
}
if (strlen($biography) > 1000) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Biografie ist zu lang. Max. 1000 Zeichen."]);
    exit;
}


try {
    // Passwort hashen
    $hash = password_hash($password, PASSWORD_DEFAULT);

    // Insert in users (inkl. Profil-Daten, wenn Deine Tabelle es unterstützt)
    $stmt = $pdo->prepare("
      INSERT INTO user_profiles
        (name, email, password, age, gender, biography)
      VALUES
        (:name, :email, :pass, :age, :gender, :bio)
    ");
    $stmt->execute([
      ':name'   => $name,
      ':email'  => $email,
      ':pass'   => $hash,
      ':age'    => (int)$age,
      ':gender' => $gender,
      ':bio'    => $biography
    ]);

    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    error_log("Register-Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Registrierung fehlgeschlagen.",
        "error" => $e->getMessage()
    ]);
}
