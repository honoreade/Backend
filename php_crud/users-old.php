<?php
require_once 'db.php';

// Get database connection
$db = getDbConnection();

// Process form submissions
$message = '';
$error = '';

// Handle user deletion
if (isset($_POST['delete']) && isset($_POST['id'])) {
    $id = (int)$_POST['id'];
    $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
    if ($stmt->execute([$id])) {
        $message = "User deleted successfully!";
    } else {
        $error = "Failed to delete user.";
    }
}

// Handle user creation/update
if (isset($_POST['save'])) {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $id = isset($_POST['id']) ? (int)$_POST['id'] : null;

    if (empty($name) || empty($email)) {
        $error = "Name and email are required.";
    } else {
        if ($id) {
            // Update existing user
            $stmt = $db->prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
            if ($stmt->execute([$name, $email, $id])) {
                $message = "User updated successfully!";
            } else {
                $error = "Failed to update user.";
            }
        } else {
            // Create new user
            $stmt = $db->prepare('INSERT INTO users (name, email) VALUES (?, ?)');
            if ($stmt->execute([$name, $email])) {
                $message = "User created successfully!";
            } else {
                $error = "Failed to create user.";
            }
        }
    }
}

// Get user for editing if ID is provided
$editUser = null;
if (isset($_GET['edit'])) {
    $id = (int)$_GET['edit'];
    $stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$id]);
    $editUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$editUser) {
        $error = "User not found.";
    }
}

// Get all users
$stmt = $db->query('SELECT * FROM users ORDER BY id');
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html>
<head>
    <title>PHP CRUD Example (Traditional)</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .message { color: green; margin-bottom: 10px; }
        .error { color: red; margin-bottom: 10px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        table, th, td { border: 1px solid #ddd; }
        th, td { padding: 10px; text-align: left; }
        th { background-color: #f2f2f2; }
        form { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; background-color: #f9f9f9; }
        label { display: block; margin-bottom: 5px; }
        input[type="text"], input[type="email"] { width: 300px; padding: 5px; margin-bottom: 10px; }
        button { padding: 8px 15px; background-color: #4CAF50; color: white; border: none; cursor: pointer; }
        button.delete { background-color: #f44336; }
        button.edit { background-color: #2196F3; }
        button.cancel { background-color: #607D8B; }
    </style>
</head>
<body>
    <h1>User Management (Traditional PHP with Page Reloads)</h1>

    <?php if ($message): ?>
        <div class="message"><?= htmlspecialchars($message) ?></div>
    <?php endif; ?>

    <?php if ($error): ?>
        <div class="error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <!-- User Form -->
    <form method="post" action="users-old.php">
        <h2><?= $editUser ? 'Edit User' : 'Add New User' ?></h2>
        
        <?php if ($editUser): ?>
            <input type="hidden" name="id" value="<?= $editUser['id'] ?>">
        <?php endif; ?>

        <div>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" value="<?= htmlspecialchars($editUser['name'] ?? '') ?>" required>
        </div>

        <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="<?= htmlspecialchars($editUser['email'] ?? '') ?>" required>
        </div>

        <div>
            <button type="submit" name="save">Save User</button>
            <?php if ($editUser): ?>
                <a href="users-old.php"><button type="button" class="cancel">Cancel</button></a>
            <?php endif; ?>
        </div>
    </form>

    <!-- Users Table -->
    <h2>Users List</h2>

    <?php if (count($users) > 0): ?>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Created At</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($users as $user): ?>
                    <tr>
                        <td><?= $user['id'] ?></td>
                        <td><?= htmlspecialchars($user['name']) ?></td>
                        <td><?= htmlspecialchars($user['email']) ?></td>
                        <td><?= htmlspecialchars($user['created_at']) ?></td>
                        <td>
                            <a href="users-old.php?edit=<?= $user['id'] ?>">
                                <button type="button" class="edit">Edit</button>
                            </a>
                            <form method="post" action="users-old.php" style="display: inline;">
                                <input type="hidden" name="id" value="<?= $user['id'] ?>">
                                <button type="submit" name="delete" class="delete"
                                        onclick="return confirm('Are you sure you want to delete this user?')">
                                    Delete
                                </button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php else: ?>
        <p>No users found.</p>
    <?php endif; ?>
</body>
</html>
