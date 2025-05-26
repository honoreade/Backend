/**
 * Main Server Application
 * 
 * This file creates a Node.js HTTP server that handles various routes
 * for a simple user management system.
 */

// Import required modules
// Node.js uses require() instead of PHP's include/require
var http = require('http');
var fs = require('fs'); // File System module for reading/writing files

// Import our custom database module
// Similar to including a PHP class file
const { db, initDb } = require('./db');

// Import API handler
const { handleApiRequest } = require('./api');

// Initialize the database connection
// In PHP, this might be done with mysqli_connect() or PDO
initDb();

/**
 * Route Handlers
 * Each function handles a specific route/endpoint
 */

// Home page handler
function handleHomePage(req, res) {
    // Read file asynchronously (non-blocking)
    // Unlike PHP's file_get_contents which is synchronous
    fs.readFile('index.html', (err, data) => {
        if (err) {
            res.statusCode = 500;
            res.write('Error: Server Error');
        } else {
            res.write(data);
        }
        res.end();
    });
}

// Users list page handler
function handleUsersListPage(req, res) {
    // Query database for all users
    // Similar to PHP's mysqli_query or PDO query
    db.all('SELECT * FROM users ORDER BY id', [], (err, users) => {
        if (err) {
            res.statusCode = 500;
            res.write('Error: Database Error');
            return res.end();
        }
        
        // Read the HTML template
        fs.readFile('users-old.html', (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.write('Error: Server Error');
                return res.end();
            }
            
            // Convert template to string and replace placeholder with users table
            // Similar to PHP's output buffering or template systems
            let html = data.toString();
            let usersTable = generateUsersTable(users);
            
            // Replace placeholder with users table
            // Similar to PHP's str_replace
            html = html.replace('<!-- USERS_TABLE_PLACEHOLDER -->', usersTable);
            
            res.write(html);
            res.end();
        });
    });
}

// Helper function to generate HTML table from users data
function generateUsersTable(users) {
    if (users.length === 0) {
        return '<p>No users found.</p>';
    }
    
    let tableHtml = '<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Created At</th><th>Actions</th></tr></thead><tbody>';
    
    // Loop through users (similar to PHP's foreach)
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

// New user form page handler
function handleNewUserPage(req, res) {
    fs.readFile('users-new.html', (err, data) => {
        if (err) {
            res.statusCode = 500;
            res.write('Error: Server Error');
        } else {
            res.write(data);
        }
        res.end();
    });
}

// Add user form submission handler
function handleAddUser(req, res) {
    // Collect POST data (different from PHP's $_POST)
    let body = '';
    
    // Data comes in chunks in Node.js
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    // Process the complete data when finished receiving
    req.on('end', () => {
        // Parse form data (similar to PHP's parse_str)
        const formData = new URLSearchParams(body);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email')
        };
        
        // Validate required fields
        if (!userData.name || !userData.email) {
            redirectTo(res, '/users-old.html');
            return;
        }
        
        // Insert user into database (using parameterized query for security)
        // Similar to PHP's prepared statements
        db.run(
            'INSERT INTO users (name, email) VALUES (?, ?)',
            [userData.name, userData.email],
            function(err) {
                redirectTo(res, '/users-old.html');
            }
        );
    });
}

// Edit user page handler
function handleEditUserPage(req, res) {
    // Parse the user ID from the query string
    // Similar to PHP's $_GET
    const urlObj = new URL(req.url, 'http://localhost');
    const userId = urlObj.searchParams.get('id');
    
    if (!userId) {
        return redirectTo(res, '/users-old.html');
    }
    
    // Get user data from database
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
            return redirectTo(res, '/users-old.html');
        }
        
        // Read the HTML template
        fs.readFile('users-old.html', (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.write('Error: Server Error');
                return res.end();
            }
            
            // Modify the template for editing
            let html = data.toString();
            
            // Update form title and action
            html = html.replace('<h2 id="form-title">Add New User</h2>', 
                               '<h2 id="form-title">Edit User</h2>');
            html = html.replace('action="/add-user"', `action="/edit-user?id=${userId}"`);
            
            // Set form values
            html = html.replace('name="name" value=""', `name="name" value="${user.name}"`);
            html = html.replace('name="email" value=""', `name="email" value="${user.email}"`);
            
            // Get all users for the table
            db.all('SELECT * FROM users ORDER BY id', [], (err, users) => {
                if (err) {
                    res.statusCode = 500;
                    res.write('Error: Database Error');
                    return res.end();
                }
                
                // Generate users table
                let usersTable = generateUsersTable(users);
                
                // Replace placeholder with users table
                html = html.replace('<!-- USERS_TABLE_PLACEHOLDER -->', usersTable);
                
                res.write(html);
                res.end();
            });
        });
    });
}

// Update user form submission handler
function handleUpdateUser(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        // Parse the user ID from the query string
        const urlObj = new URL(req.url, 'http://localhost');
        const userId = urlObj.searchParams.get('id');
        
        // Parse form data
        const formData = new URLSearchParams(body);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email')
        };
        
        // Validate required fields
        if (!userId || !userData.name || !userData.email) {
            return redirectTo(res, '/users-old.html');
        }
        
        // Update user in database
        db.run(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [userData.name, userData.email, userId],
            function(err) {
                redirectTo(res, '/users-old.html');
            }
        );
    });
}

// Delete user form submission handler
function handleDeleteUser(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        // Parse form data
        const formData = new URLSearchParams(body);
        const userId = formData.get('id');
        
        // Validate user ID
        if (!userId) {
            return redirectTo(res, '/users-old.html');
        }
        
        // Delete user from database
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
// Similar to PHP's header("Location: ...")
function redirectTo(res, url) {
    res.statusCode = 302; // Redirect status code
    res.setHeader('Location', url);
    res.end();
}

/**
 * Main Request Handler
 * 
 * This function routes incoming requests to the appropriate handler
 * Similar to PHP's routing in frameworks like Laravel or CodeIgniter
 */
const handleRequest = (req, res) => {
    // Set default response headers
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    
    // Get request method (GET, POST, etc.)
    const method = req.method;
    
    // Route requests to appropriate handlers based on URL and method
    // Similar to PHP's switch statement or router configurations
    
    // Home page
    if (req.url === '/') {
        handleHomePage(req, res);
    }
    // Users list page
    else if (req.url === '/users-old.html') {
        handleUsersListPage(req, res);
    }
    // New user form page
    else if (req.url === '/users-new.html') {
        handleNewUserPage(req, res);
    }
    // Add user form submission
    else if (req.url === '/add-user' && method === 'POST') {
        handleAddUser(req, res);
    }
    // Edit user page and form submission
    else if (req.url.startsWith('/edit-user')) {
        if (method === 'GET') {
            handleEditUserPage(req, res);
        } else if (method === 'POST') {
            handleUpdateUser(req, res);
        }
    }
    // Delete user form submission
    else if (req.url === '/delete-user' && method === 'POST') {
        handleDeleteUser(req, res);
    }
    // 404 Not Found for any other routes
    else {
        res.statusCode = 404;
        res.write('Page not found');
        res.end();
    }
};

// Create HTTP server
// In PHP, the web server (Apache/Nginx) handles requests
// In Node.js, we create our own HTTP server
const server = http.createServer(handleRequest);

// Start the server and listen on port 3000
// Similar to PHP's always-running Apache/Nginx server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});






