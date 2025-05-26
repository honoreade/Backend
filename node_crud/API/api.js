/**
 * API Routes Module
 * 
 * This module provides RESTful API endpoints for user management.
 * Similar to how a modern PHP framework would have API controllers.
 */

// Import database module
const { db } = require('./db');

// User API endpoints
const userApi = {
  /**
   * Get all users
   * GET /api/users
   */
  getAllUsers: (req, res) => {
    db.all('SELECT * FROM users ORDER BY id', [], (err, users) => {
      if (err) {
        return sendJsonResponse(res, 500, { error: 'Database error' });
      }
      sendJsonResponse(res, 200, { users });
    });
  },

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  getUserById: (req, res, id) => {
    // Validate ID parameter
    if (!id) {
      return sendJsonResponse(res, 400, { error: 'User ID is required' });
    }

    db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
      if (err) {
        return sendJsonResponse(res, 500, { error: 'Database error' });
      }
      if (!user) {
        return sendJsonResponse(res, 404, { error: 'User not found' });
      }
      sendJsonResponse(res, 200, { user });
    });
  },

  /**
   * Create new user
   * POST /api/users
   */
  createUser: (req, res, userData) => {
    // Validate required fields
    if (!userData || !userData.name || !userData.email) {
      return sendJsonResponse(res, 400, { error: 'Name and email are required' });
    }

    // Insert user into database
    db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [userData.name, userData.email],
      function(err) {
        if (err) {
          return sendJsonResponse(res, 500, { error: 'Failed to create user' });
        }
        
        // Return the created user with ID
        const userId = this.lastID;
        sendJsonResponse(res, 201, { 
          message: 'User created successfully',
          user: {
            id: userId,
            name: userData.name,
            email: userData.email
          }
        });
      }
    );
  },

  /**
   * Update existing user
   * PUT /api/users/:id
   */
  updateUser: (req, res, id, userData) => {
    // Validate required fields
    if (!id) {
      return sendJsonResponse(res, 400, { error: 'User ID is required' });
    }
    if (!userData || !userData.name || !userData.email) {
      return sendJsonResponse(res, 400, { error: 'Name and email are required' });
    }

    // Update user in database
    db.run(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [userData.name, userData.email, id],
      function(err) {
        if (err) {
          return sendJsonResponse(res, 500, { error: 'Failed to update user' });
        }
        
        // Check if user was found and updated
        if (this.changes === 0) {
          return sendJsonResponse(res, 404, { error: 'User not found' });
        }
        
        sendJsonResponse(res, 200, { 
          message: 'User updated successfully',
          user: {
            id: parseInt(id),
            name: userData.name,
            email: userData.email
          }
        });
      }
    );
  },

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  deleteUser: (req, res, id) => {
    // Validate ID parameter
    if (!id) {
      return sendJsonResponse(res, 400, { error: 'User ID is required' });
    }

    // Delete user from database
    db.run(
      'DELETE FROM users WHERE id = ?',
      [id],
      function(err) {
        if (err) {
          return sendJsonResponse(res, 500, { error: 'Failed to delete user' });
        }
        
        // Check if user was found and deleted
        if (this.changes === 0) {
          return sendJsonResponse(res, 404, { error: 'User not found' });
        }
        
        sendJsonResponse(res, 200, { message: 'User deleted successfully' });
      }
    );
  }
};

/**
 * Helper function to send JSON responses
 * Sets appropriate headers and status code
 */
function sendJsonResponse(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/**
 * Parse JSON request body
 * Returns a Promise that resolves with the parsed data
 */
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        // Handle empty body
        if (body.trim() === '') {
          resolve({});
        } else {
          const data = JSON.parse(body);
          resolve(data);
        }
      } catch (error) {
        reject(error);
      }
    });
    
    req.on('error', error => {
      reject(error);
    });
  });
}

/**
 * Handle API routes
 * This function routes API requests to the appropriate handler
 * Returns true if the request was handled, false otherwise
 */
function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;
  
  // Extract path parameters (e.g., /api/users/123 -> id=123)
  const pathParts = path.split('/').filter(part => part);
  
  // API routes
  if (pathParts[0] === 'api') {
    // Users endpoints
    if (pathParts[1] === 'users') {
      const userId = pathParts[2];
      
      // GET /api/users - Get all users
      if (method === 'GET' && !userId) {
        userApi.getAllUsers(req, res);
        return true;
      }
      
      // GET /api/users/:id - Get user by ID
      if (method === 'GET' && userId) {
        userApi.getUserById(req, res, userId);
        return true;
      }
      
      // POST /api/users - Create new user
      if (method === 'POST' && !userId) {
        parseJsonBody(req)
          .then(userData => userApi.createUser(req, res, userData))
          .catch(error => {
            sendJsonResponse(res, 400, { error: 'Invalid JSON data' });
          });
        return true;
      }
      
      // PUT /api/users/:id - Update user
      if (method === 'PUT' && userId) {
        parseJsonBody(req)
          .then(userData => userApi.updateUser(req, res, userId, userData))
          .catch(error => {
            sendJsonResponse(res, 400, { error: 'Invalid JSON data' });
          });
        return true;
      }
      
      // DELETE /api/users/:id - Delete user
      if (method === 'DELETE' && userId) {
        userApi.deleteUser(req, res, userId);
        return true;
      }
    }
    
    // If we reach here, the API endpoint doesn't exist
    sendJsonResponse(res, 404, { error: 'API endpoint not found' });
    return true;
  }
  
  // Not an API route
  return false;
}

module.exports = { handleApiRequest };

