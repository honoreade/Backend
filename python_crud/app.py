import os
import sys
from flask import Flask, render_template, request, redirect, url_for, flash

# Add the current directory to the path so we can import the modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from models import db, User
from api import api

# Create a function to initialize the app
def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'your-secret-key'  # For flash messages

    # Initialize the database with the app
    db.init_app(app)

    # Register the API blueprint
    app.register_blueprint(api, url_prefix='/api')

    return app

app = create_app()

# Create and initialize the database
def init_db():
    with app.app_context():
        db.create_all()

        # Add sample data if the users table is empty
        if User.query.count() == 0:
            sample_users = [
                User(name='John Doe', email='john@example.com'),
                User(name='Jane Smith', email='jane@example.com'),
                User(name='Bob Johnson', email='bob@example.com')
            ]
            db.session.add_all(sample_users)
            db.session.commit()

# Traditional approach routes (with page reloads)
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/users-old')
def users_old():
    users = User.query.all()
    return render_template('users-old.html', users=users)

@app.route('/users-old/create', methods=['POST'])
def create_user_old():
    name = request.form.get('name')
    email = request.form.get('email')

    if not name or not email:
        flash('Name and email are required', 'error')
        return redirect(url_for('users_old'))

    user = User(name=name, email=email)
    db.session.add(user)
    db.session.commit()

    flash('User created successfully', 'success')
    return redirect(url_for('users_old'))

@app.route('/users-old/edit/<int:user_id>', methods=['GET', 'POST'])
def edit_user_old(user_id):
    user = User.query.get_or_404(user_id)

    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')

        if not name or not email:
            flash('Name and email are required', 'error')
            return render_template('edit-user-old.html', user=user)

        user.name = name
        user.email = email
        db.session.commit()

        flash('User updated successfully', 'success')
        return redirect(url_for('users_old'))

    return render_template('edit-user-old.html', user=user)

@app.route('/users-old/delete/<int:user_id>', methods=['POST'])
def delete_user_old(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()

    flash('User deleted successfully', 'success')
    return redirect(url_for('users_old'))

# Modern approach route (without page reloads)
@app.route('/users-new')
def users_new():
    return render_template('users-new.html')

if __name__ == '__main__':
    # Initialize the database bef   ore running the app
    init_db()
    app.run(debug=True)
