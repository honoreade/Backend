<?php
header('Content-Type: application/json');
require_once 'db.php';

// Get database connection
$db = getDbConnection();

// Determine the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get the user ID from the query string if provided
$userId = isset($_GET['id']) ? (int)$_GET['id'] : null;

// Handle different HTTP methods
switch ($method) {
    case 'GET':
        // READ operation
        if ($userId) {
            // Get a specific user
            $stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                echo json_encode($user);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }
        } else {
            // Get all users
            $stmt = $db->query('SELECT * FROM users ORDER BY id');
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($users);
        }
        break;

    case 'POST':
        // CREATE operation
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['name']) || !isset($data['email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name and email are required']);
            break;
        }

        $stmt = $db->prepare('INSERT INTO users (name, email) VALUES (?, ?)');
        $result = $stmt->execute([$data['name'], $data['email']]);

        if ($result) {
            $data['id'] = $db->lastInsertId();
            $data['created_at'] = date('Y-m-d H:i:s');
            http_response_code(201);
            echo json_encode($data);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create user']);
        }
        break;

    case 'PUT':
        // UPDATE operation
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            break;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['name']) || !isset($data['email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name and email are required']);
            break;
        }

        $stmt = $db->prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
        $result = $stmt->execute([$data['name'], $data['email'], $userId]);

        if ($result) {
            $stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($user);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update user']);
        }
        break;

    case 'DELETE':
        // DELETE operation
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            break;
        }

        $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
        $result = $stmt->execute([$userId]);

        if ($result) {
            echo json_encode(['success' => true, 'message' => 'User deleted']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete user']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
