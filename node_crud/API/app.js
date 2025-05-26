/**
 * Main Server Application
 * 
 * This file creates a Node.js HTTP server that handles various routes
 * for a simple user management system.
 */

// Import required modules
var http = require('http');
var fs = require('fs'); 
var path = require('path');

// Import our custom modules
const { db, initDb } = require('./db');
const { handleApiRequest } = require('./api');

// Initialize the database connection
initDb();

/**
 * Serve static files (HTML, CSS, JS)
 */
function serveStaticFile(req, res, filePath) {
  // Make path relative to current directory
  filePath = path.join(__dirname, filePath);
  
  // Get file extension to set correct content type
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
  }
  
  // Read and serve the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.statusCode = 404;
        res.end('File not found');
      } else {
        // Server error
        res.statusCode = 500;
        res.end('Server Error');
      }
    } else {
      // Success - send the file
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.end(content);
    }
  });
}

/**
 * Main Request Handler
 */
const handleRequest = (req, res) => {
  // First check if this is an API request
  const isApiRequest = handleApiRequest(req, res);
  if (isApiRequest) {
    return; // API handler took care of the response
  }
  
  // Handle regular routes
  const url = req.url;
  const method = req.method;
  
  // Home page
  if (url === '/' || url === '/index.html') {
    serveStaticFile(req, res, 'index.html');
  }
  // Traditional users page (with page reloads)
  else if (url === '/users-old.html') {
    handleUsersListPage(req, res);
  }
  // Modern users page (with API and no reloads)
  else if (url === '/users-new.html') {
    serveStaticFile(req, res, 'users-new.html');
  }
  // Client-side JavaScript
  else if (url === '/users.js') {
    serveStaticFile(req, res, 'users.js');
  }
  // Add user form submission (traditional approach)
  else if (url === '/add-user' && method === 'POST') {
    handleAddUser(req, res);
  }
  // Edit user page and form submission (traditional approach)
  else if (url.startsWith('/edit-user')) {
    if (method === 'GET') {
      handleEditUserPage(req, res);
    } else if (method === 'POST') {
      handleUpdateUser(req, res);
    }
  }
  // Delete user form submission (traditional approach)
  else if (url === '/delete-user' && method === 'POST') {
    handleDeleteUser(req, res);
  }
  // 404 Not Found for any other routes
  else {
    res.statusCode = 404;
    res.end('Page not found');
  }
};

// Create HTTP server
const server = http.createServer(handleRequest);

// Start the server and listen on port 3000
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

// Include the traditional approach handlers
// These are kept for backward compatibility
// New code should use the API endpoints

// Users list page handler (traditional approach)
function handleUsersListPage(req, res) {
  db.all('SELECT * FROM users ORDER BY id', [], (err, users) => {
    if (err) {
      res.statusCode = 500;
      res.end('Error: Database Error');
      return;
    }
    
    fs.readFile(path.join(__dirname, 'users-old.html'), (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Error: Server Error');
        return;
      }
      
      let html = data.toString();
      let usersTable = generateUsersTable(users);
      html = html.replace('<!-- USERS_TABLE_PLACEHOLDER -->', usersTable);
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(html);
    });
  });
}

// Helper function to generate HTML table from users data
function generateUsersTable(users) {
  if (users.length === 0) {
    return '<p>No users found.</p>';
  }
  
  let tableHtml = '<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Created At</th><th>Actions</th></tr></thead><tbody>';
  
  users.forEach(user => {
    tableHtml += `<tr>
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.created_at || ''}</td>
      <td>
        <a href="/edit-user?id=${user.id}">
          <button type="button" class="edit">Edit</button>
        </a>
        <form method="post" action="/delete-user" style="display: inline;">
          <input type="hidden" name="id" value="${user.id}">
          <button type="submit" class="delete">Delete</button>
        </form>
      </td>
    </tr>`;
  });
  
  tableHtml += '</tbody></table>';
  return tableHtml;
}

// Add user form submission handler (traditional approach)
function handleAddUser(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    const formData = new URLSearchParams(body);
    const userData = {
      name: formData.get('name'),
      email: formData.get('email')
    };
    
    if (!userData.name || !userData.email) {
      redirectTo(res, '/users-old.html');
      return;
    }
    
    db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [userData.name, userData.email],
      function(err) {
        redirectTo(res, '/users-old.html');
      }
    );
  });
}

// Edit user page handler (traditional approach)
function handleEditUserPage(req, res) {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const userId = urlObj.searchParams.get('id');
  
  if (!userId) {
    return redirectTo(res, '/users-old.html');
  }
  
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user) {
      return redirectTo(res, '/users-old.html');
    }
    
    fs.readFile(path.join(__dirname, 'users-old.html'), (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Error: Server Error');
        return;
      }
      
      let html = data.toString();
      
      html = html.replace('<h2 id="form-title">Add New User</h2>', 
                         '<h2 id="form-title">Edit User</h2>');
      html = html.replace('action="/add-user"', `action="/edit-user?id=${userId}"`);
      
      html = html.replace('name="name" value=""', `name="name" value="${user.name}"`);
      html = html.replace('name="email" value=""', `name="email" value="${user.email}"`);
      
      db.all('SELECT * FROM users ORDER BY id', [], (err, users) => {
        if (err) {
          res.statusCode = 500;
          res.end('Error: Database Error');
          return;
        }
        
        let usersTable = generateUsersTable(users);
        html = html.replace('<!-- USERS_TABLE_PLACEHOLDER -->', usersTable);
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(html);
      });
    });
  });
}

// Update user form submission handler (traditional approach)
function handleUpdateUser(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const userId = urlObj.searchParams.get('id');
    
    const formData = new URLSearchParams(body);
    const userData = {
      name: formData.get('name'),
      email: formData.get('email')
    };
    
    if (!userId || !userData.name || !userData.email) {
      return redirectTo(res, '/users-old.html');
    }
    
    db.run(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [userData.name, userData.email, userId],
      function(err) {
        redirectTo(res, '/users-old.html');
      }
    );
  });
}

// Delete user form submission handler (traditional approach)
function handleDeleteUser(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    const formData = new URLSearchParams(body);
    const userId = formData.get('id');
    
    if (!userId) {
      return redirectTo(res, '/users-old.html');
    }
    
    db.run(
      'DELETE FROM users WHERE id = ?',
      [userId],
      function(err) {
        redirectTo(res, '/users-old.html');
      }
    );
  });
}

// Helper function for redirects
function redirectTo(res, url) {
  res.statusCode = 302;
  res.setHeader('Location', url);
  res.end();
}

