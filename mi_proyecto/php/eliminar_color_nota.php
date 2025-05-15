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

    if (empty($fecha)) {
        echo json_encode(['tipo' => 'error', 'mensaje' => 'La fecha es obligatoria.']);
        $conn->close();
        exit();
    }

    // Primero, verificamos si hay alguna nota para ese día
    $stmt_check_nota = $conn->prepare("SELECT nota FROM notas WHERE usuario_id = ? AND fecha = ?");
    $stmt_check_nota->bind_param("is", $usuario_id, $fecha);
    $stmt_check_nota->execute();
    $result_check_nota = $stmt_check_nota->get_result();

    if ($result_check_nota->num_rows > 0) {
        $row_nota = $result_check_nota->fetch_assoc();
        if (empty(trim($row_nota['nota']))) {
            // Si no hay nota, eliminamos la entrada
            $stmt_delete = $conn->prepare("DELETE FROM notas WHERE usuario_id = ? AND fecha = ?");
            $stmt_delete->bind_param("is", $usuario_id, $fecha);

            if ($stmt_delete->execute()) {
                echo json_encode(['tipo' => 'success', 'mensaje' => 'Entrada del día eliminada.']);
            } else {
                echo json_encode(['tipo' => 'error', 'mensaje' => 'Error al eliminar la entrada del día: ' . $stmt_delete->error]);
            }
            $stmt_delete->close();
        } else {
            // Si hay una nota, solo actualizamos el color a 'base'
            $stmt_update = $conn->prepare("UPDATE notas SET color = 'base' WHERE usuario_id = ? AND fecha = ?");
            $stmt_update->bind_param("is", $usuario_id, $fecha);

            if ($stmt_update->execute()) {
                echo json_encode(['tipo' => 'success', 'mensaje' => 'Color de la nota restablecido a base.']);
            } else {
                echo json_encode(['tipo' => 'error', 'mensaje' => 'Error al restablecer el color de la nota: ' . $stmt_update->error]);
            }
            $stmt_update->close();
        }
    } else {
        // Si no se encuentra ninguna entrada para ese día
        echo json_encode(['tipo' => 'success', 'mensaje' => 'No hay entrada para eliminar.']);
    }

    $stmt_check_nota->close();

} else {
    echo json_encode(['tipo' => 'error', 'mensaje' => 'Método no permitido.']);
}

$conn->close();
?>