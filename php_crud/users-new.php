<!DOCTYPE html>
<html>
<head>
    <title>PHP CRUD Example (Modern)</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .message { color: green; margin-bottom: 10px; display: none; }
        .error { color: red; margin-bottom: 10px; display: none; }
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
        .loading { display: none; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>User Management (Modern JavaScript - No Page Reloads)</h1>

    <div id="message" class="message"></div>
    <div id="error" class="error"></div>
    <div id="loading" class="loading">Processing...</div>

    <!-- User Form -->
    <form id="user-form">
        <h2 id="form-title">Add New User</h2>
        <input type="hidden" id="user-id" value="">

        <div>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>
        </div>

        <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
        </div>

        <div>
            <button type="submit" id="save-button">Save User</button>
            <button type="button" id="cancel-button" class="cancel" style="display: none;">Cancel</button>
        </div>
    </form>

    <!-- Users Table -->
    <h2>Users List</h2>
    <div id="users-container">
        <table id="users-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Created At</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="users-list">
                <tr>
                    <td colspan="5">Loading users...</td>
                </tr>
            </tbody>
        </table>
    </div>

    <script src="users.js"></script>
</body>
</html>
