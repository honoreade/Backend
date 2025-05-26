"""
Run script for the Python CRUD application.
This script initializes the database and starts the Flask application.
"""

from app import app, init_db

if __name__ == '__main__':
    # Initialize the database
    init_db()
    
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5000)
