<?php
header('Content-Type: application/json');
require 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre_usuario = $_POST["nombre_usuario"];
    $contrasena = $_POST["contrasena"];

    if (empty($nombre_usuario) || empty($contrasena)) {
        echo json_encode(['tipo' => 'error', 'mensaje' => 'Por favor, completa todos los campos.']);
        $conn->close();
        exit();
    }

    // Verificar si el usuario ya existe
    $stmt_check = $conn->prepare("SELECT id FROM usuarios WHERE nombre_usuario = ?");
    $stmt_check->bind_param("s", $nombre_usuario);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();

    if ($result_check->num_rows > 0) {
        echo json_encode(['tipo' => 'error', 'mensaje' => 'El nombre de usuario ya existe.']);
    } else {
        // Hash de la contraseña
        $contrasena_hash = password_hash($contrasena, PASSWORD_DEFAULT);

        // Insertar el nuevo usuario
        $stmt_insert = $conn->prepare("INSERT INTO usuarios (nombre_usuario, contrasena) VALUES (?, ?)");
        $stmt_insert->bind_param("ss", $nombre_usuario, $contrasena_hash);

        if ($stmt_insert->execute()) {
            echo json_encode(['tipo' => 'success', 'mensaje' => 'Registro exitoso.']);
        } else {
            echo json_encode(['tipo' => 'error', 'mensaje' => 'Error al registrar el usuario: ' . $stmt_insert->error]);
        }

        $stmt_insert->close();
    }

    $stmt_check->close();
} else {
    echo json_encode(['tipo' => 'error', 'mensaje' => 'Método no permitido.']);
}

$conn->close();
?>