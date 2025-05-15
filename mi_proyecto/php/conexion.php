<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "pixel-calendar-db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['tipo' => 'error', 'mensaje' => 'Error de conexión a la base de datos: ' . $conn->connect_error]));
}
?>