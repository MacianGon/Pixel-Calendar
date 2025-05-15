<?php
header('Content-Type: application/json');
require 'conexion.php';
session_start();

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['tipo' => 'error', 'mensaje' => 'No estás autenticado.']);
    $conn->close();
    exit();
}

$usuario_id = $_SESSION['usuario_id'];
$fecha = $_GET["fecha"] ?? null;

if (empty($fecha)) {
    echo json_encode(['tipo' => 'error', 'mensaje' => 'Falta la fecha para cargar la nota.']);
    $conn->close();
    exit();
}

$stmt = $conn->prepare("SELECT nota, color FROM notas WHERE usuario_id = ? AND fecha = ?");
$stmt->bind_param("is", $usuario_id, $fecha);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode(['tipo' => 'success', 'nota' => $row["nota"], 'color' => $row["color"]]);
} else {
    echo json_encode(['tipo' => 'success', 'nota' => '', 'color' => 'base']); // No hay nota, color base por defecto
}

$stmt->close();
$conn->close();
?>