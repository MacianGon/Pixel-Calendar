<?php
header('Content-Type: application/json');
require 'conexion.php';
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!isset($_SESSION['usuario_id'])) {
        echo json_encode(['tipo' => 'error', 'mensaje' => 'No estás autenticado.']);
        $conn->close();
        exit();
    }

    $usuario_id = $_SESSION['usuario_id'];
    $fecha = $_POST["fecha"];
    $nota = $_POST["nota"];
    $color = $_POST["color"] ?? 'base'; // Obtener el color, 'base' por defecto

    if (empty($fecha)) {
        echo json_encode(['tipo' => 'error', 'mensaje' => 'La fecha es obligatoria.']);
        $conn->close();
        exit();
    }

    $stmt_check = $conn->prepare("SELECT id FROM notas WHERE usuario_id = ? AND fecha = ?");
    $stmt_check->bind_param("is", $usuario_id, $fecha);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();

    if ($result_check->num_rows > 0) {
        $stmt_update = $conn->prepare("UPDATE notas SET nota = ?, color = ? WHERE usuario_id = ? AND fecha = ?");
        $stmt_update->bind_param("ssis", $nota, $color, $usuario_id, $fecha);
        if ($stmt_update->execute()) {
            echo json_encode(['tipo' => 'success', 'mensaje' => 'Nota actualizada.']);
        } else {
            echo json_encode(['tipo' => 'error', 'mensaje' => 'Error al actualizar la nota: ' . $stmt_update->error]);
        }
        $stmt_update->close();
    } else {
        $stmt_insert = $conn->prepare("INSERT INTO notas (usuario_id, fecha, nota, color) VALUES (?, ?, ?, ?)");
        $stmt_insert->bind_param("isss", $usuario_id, $fecha, $nota, $color);
        if ($stmt_insert->execute()) {
            echo json_encode(['tipo' => 'success', 'mensaje' => 'Nota guardada.']);
        } else {
            echo json_encode(['tipo' => 'error', 'mensaje' => 'Error al guardar la nota: ' . $stmt_insert->error]);
        }
        $stmt_insert->close();
    }
    $stmt_check->close();
} else {
    echo json_encode(['tipo' => 'error', 'mensaje' => 'Método no permitido.']);
}

$conn->close();
?>