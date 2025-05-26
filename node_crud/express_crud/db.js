
// Import required modules
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // Path module for handling file paths

//  Create database connection
const dbPath = path.resolve(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);


//  Initialize database

function initDb() {
  // db.serialize() ensures commands run sequentially
  db.serialize(() => {
    // Create users table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Check if users table is empty
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
        const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
        
        // Insert each sample user
        sampleUsers.forEach(user => {
          stmt.run(user.name, user.email);
          console.log(`Added user: ${user.name} (${user.email})`);
        });
        
        // Finalize the prepared statement to release resources
        stmt.finalize();
        
        console.log('Sample users added to database');
      }
    });
  });
}


// Export the database connection and initialization function
module.exports = { db, initDb };

// initDb();
