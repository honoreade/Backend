# PHP CRUD Examples

A simple demonstration of CRUD (Create, Read, Update, Delete) operations in PHP using two different approaches:

1. **Traditional PHP** - with page reloads
2. **Modern JavaScript** - without page reloads (AJAX)

## Features

- Complete CRUD functionality for user management
- SQLite database (no setup required)
- RESTful API endpoint
- Form validation
- Error handling
- Responsive design

## Files

- `index.php` - Landing page
- `db.php` - Database connection
- `api-users.php` - RESTful API endpoint
- `users-old.php` - Traditional PHP implementation
- `users-new.php` - Modern implementation (HTML)
- `users.js` - JavaScript for the modern implementation

## Usage

1. Place the files in your web server directory
2. Access the application at `http://localhost/your-directory/`
3. Try both implementations to see the difference

## Requirements

- PHP 7.4+
- Web server (Apache, Nginx, etc.)
- SQLite support enabled in PHP

## Security Notes

- Uses prepared statements to prevent SQL injection
- Input validation on both client and server side
- Proper error handling

## License

MIT
