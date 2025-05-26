<?php
// Simple database connection using SQLite
function getDbConnection() {
    $dbFile = __DIR__ . '/users.db';
    $createTable = !file_exists($dbFile);
    
    try {
        $db = new PDO('sqlite:' . $dbFile);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        if ($createTable) {
            // Create users table if it doesn't exist
            $db->exec('
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ');
            
            // Insert some sample data
            $db->exec("
                INSERT INTO users (name, email) VALUES 
                ('John Doe', 'john@example.com'),
                ('Jane Smith', 'jane@example.com'),
                ('Bob Johnson', 'bob@example.com')
            ");
        }
        
        return $db;
    } catch (PDOException $e) {
        die("Database connection failed: " . $e->getMessage());
    }
}
