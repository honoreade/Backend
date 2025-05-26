const express = require("express");
const app = express();
const path = require("path")

// Import database module
const { db } = require('./db');
// add static files from public dir
app.use(express.static('public'));

// Enable JSON parsing for request bodies
app.use(express.json());

// APi endpoint to get all users
app.get("/users", (req, res) =>{
    db.all('SELECT * FROM users ORDER BY id', [], (err, users) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to retrieve users' });
            return;
        }
        res.json(users);
    });
});

// APi endpoint to get user by id
app.get("/user/:id", (req, res) =>{
    const id = req.params.id;
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to retrieve user' });
            return;
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    });
});

// APi endpoint to create new user
app.post("/users/new", (req, res) =>{
    const userData = req.body;

    // Validate required fields
    if (!userData || !userData.name || !userData.email) {
        console.log('Name and email are required')
        return res.status(400).send('Name and email are required');
    }
    // Insert user into database
    db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [userData.name, userData.email],
      function(err) {
        if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to Create user' });
        }
            return res.status(201).json({ message: 'User created successfully' });
        }
    );
});

// APi endpoint to delete user by id
app.delete("/user/delete/:id", (req, res) =>{
    const id = req.params.id;
    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    // Delete user from database
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete user' });
        }

        // Check if a row was actually deleted
        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
});
});

// APi endpoint to update user by id
app.put("/user/update/:id", (req, res) =>{
    const id = req.params.id;
    const userData = req.body;

    if (!userData || !userData.name || !userData.email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    // Update user in database
    db.run(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [userData.name, userData.email, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update user' });
        }

        // Check if user was found and updated
        if (this.changes === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
          message: 'User updated successfully',
          user: {
            id: parseInt(id),
            name: userData.name,
            email: userData.email
          }
        });
      }
    );
});

// Start the server and listen for incoming requests
const port = 8000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});