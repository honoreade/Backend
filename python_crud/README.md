# Python Flask CRUD Example

A simple demonstration of CRUD (Create, Read, Update, Delete) operations in Python Flask using two different approaches:

1. **Traditional Flask** - with page reloads
2. **Modern JavaScript** - without page reloads (AJAX)

## Features

- Complete CRUD functionality for user management
- SQLite database with SQLAlchemy ORM
- RESTful API endpoints
- Form validation
- Error handling
- Responsive design

## Project Structure

- `app.py` - Main Flask application
- `models.py` - Database models using SQLAlchemy
- `api.py` - RESTful API endpoints
- `templates/` - HTML templates
  - `base.html` - Base template with common styles
  - `index.html` - Landing page
  - `users-old.html` - Traditional implementation
  - `edit-user-old.html` - Edit page for traditional approach
  - `users-new.html` - Modern implementation with JavaScript

## Installation

1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Run the application:
   ```
   python run.py
   ```
5. Access the application at `http://localhost:5000/`

## Troubleshooting

If you encounter import errors, make sure you're running the application from the correct directory:

```
cd python_crud
python run.py
```

If you get a "ModuleNotFoundError" for Flask or SQLAlchemy, make sure you've installed the dependencies:

```
pip install -r requirements.txt
```

## Requirements

- Python 3.7+
- Flask
- Flask-SQLAlchemy

## Security Notes

- Uses SQLAlchemy ORM to prevent SQL injection
- Input validation on both client and server side
- Proper error handling

## License

MIT
