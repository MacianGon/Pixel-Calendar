<?php
header('Content-Type: application/json');
require 'conexion.php';
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre_usuario = $_POST["nombre_usuario"];
    $contrasena = $_POST["contrasena"];

    if (empty($nombre_usuario) || empty($contrasena)) {
        echo json_encode(['tipo' => 'error', 'mensaje' => 'Por favor, introduce usuario y contraseña.']);
        $conn->close();
        exit();
    }

    $stmt = $conn->prepare("SELECT id, contrasena FROM usuarios WHERE nombre_usuario = ?");
    $stmt->bind_param("s", $nombre_usuario);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        if (password_verify($contrasena, $row["contrasena"])) {
            $_SESSION['usuario_id'] = $row["id"];
            echo json_encode(['tipo' => 'success', 'mensaje' => 'Inicio de sesión exitoso.', 'usuario_id' => $row["id"]]);
        } else {
            echo json_encode(['tipo' => 'error', 'mensaje' => 'Usuario o contraseña incorrectos.']);
        }
    } else {
        echo json_encode(['tipo' => 'error', 'mensaje' => 'Usuario o contraseña incorrectos.']);
    }

    $stmt->close();
} else {
    echo json_encode(['tipo' => 'error', 'mensaje' => 'Método no permitido.']);
}

$conn->close();
?>