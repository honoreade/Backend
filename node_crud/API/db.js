/**
 * Database Module
 * 
 * This module handles database connection and initialization.
 * In PHP, this might be a separate include file with database functions.
 */

// Import SQLite3 module (similar to PHP's SQLite extension)
// The verbose() method enables more detailed error messages
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // Path module for handling file paths

/**
 * Create database connection
 * 
 * In PHP, you might use:
 * $db = new SQLite3('users.db');
 * 
 * In Node.js, we first resolve the full path to the database file,
 * then create a new database connection
 */
const dbPath = path.resolve(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

/**
 * Initialize database
 * 
 * This function creates necessary tables and adds sample data if needed.
 * In PHP, this might be part of an installation script.
 */
function initDb() {
  // db.serialize() ensures commands run sequentially
  // (similar to running SQL statements one after another in PHP)
  db.serialize(() => {
    // Create users table if it doesn't exist
    // Similar to PHP: $db->exec('CREATE TABLE IF NOT EXISTS users...')
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Check if users table is empty
    // In PHP: $result = $db->query('SELECT COUNT(*) as count FROM users');
    //         $row = $result->fetchArray(SQLITE3_ASSOC);
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        console.error('Error checking users table:', err);
        return;
      }
      
      console.log(`Current user count in database: ${row.count}`);
      
      // Add sample data if table is empty
      if (row.count === 0) {
        // Sample user data
        const sampleUsers = [
          { name: 'John Doe', email: 'john@example.com' },
          { name: 'Jane Smith', email: 'jane@example.com' },
          { name: 'Bob Johnson', email: 'bob@example.com' }
        ];
        
        // Prepare statement for inserting users
        // Similar to PHP prepared statements:
        // $stmt = $db->prepare('INSERT INTO users (name, email) VALUES (?, ?)');
        const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
        
        // Insert each sample user
        // In PHP: foreach($sampleUsers as $user) { $stmt->execute([$user['name'], $user['email']]); }
        sampleUsers.forEach(user => {
          stmt.run(user.name, user.email);
          console.log(`Added user: ${user.name} (${user.email})`);
        });
        
        // Finalize the prepared statement (required in Node.js SQLite)
        // This releases resources - not typically needed in PHP
        stmt.finalize();
        
        console.log('Sample users added to database');
        
        // // Log all users after adding samples
        // // In PHP: $result = $db->query('SELECT * FROM users');
        // //         while($row = $result->fetchArray(SQLITE3_ASSOC)) { ... }
        // db.all('SELECT * FROM users', (err, users) => {
        //   if (err) {
        //     console.error('Error retrieving users:', err);
        //     return;
        //   }
        //   console.log('All users in database:');
        //   users.forEach(user => {
        //     console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Created: ${user.created_at}`);
        //   });
        // });
      } else {
        // // Log all existing users
        // // Note: Node.js uses callbacks for async operations
        // // PHP would use a loop to fetch rows synchronously
        // db.all('SELECT * FROM users', (err, users) => {
        //   if (err) {
        //     console.error('Error retrieving users:', err);
        //     return;
        //   }
        //   console.log('All users in database:');
        //   users.forEach(user => {
        //     console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Created: ${user.created_at}`);
        //   });
        // });
      }
    });
  });
}

// Export the database connection and initialization function
// In PHP, these might be global variables or functions
module.exports = { db, initDb };