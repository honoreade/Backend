// ... existing code ...

app.delete("/users/:id", (req, res) => {
  const id = req.params.id;

  // Validate the ID to ensure it's an integer
  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'Invalid user ID. Must be an integer.' });
  }

  console.log(`Deleting user with ID: ${id}`); // More descriptive logging

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      console.error(`Database error deleting user: ${err}`);
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    // Check if a row was actually deleted
    if (this.changes === 0) {
      console.log(`User with ID ${id} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`User with ID ${id} deleted successfully`);
    res.status(200).json({ message: 'User deleted successfully' }); // Or 204 No Content
  });
});

// ... existing code ...