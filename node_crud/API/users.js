/**
 * Modern JavaScript Client for User Management
 * 
 * This file handles all client-side interactions with the API
 * without requiring page reloads (similar to modern PHP frameworks with AJAX).
 */

// DOM elements
const userForm = document.getElementById('user-form');
const usersList = document.getElementById('users-list');
const formTitle = document.getElementById('form-title');
const saveButton = document.getElementById('save-button');
const cancelButton = document.getElementById('cancel-button');
const userIdField = document.getElementById('user-id');
const nameField = document.getElementById('name');
const emailField = document.getElementById('email');
const messageDiv = document.getElementById('message');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');

// API endpoints
const API_ENDPOINTS = {
  GET_ALL: '/api/users',
  GET_ONE: '/api/users/',
  CREATE: '/api/users',
  UPDATE: '/api/users/',
  DELETE: '/api/users/'
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  // Load all users when page loads
  loadUsers();
  
  // Set up event listeners
  userForm.addEventListener('submit', handleFormSubmit);
  cancelButton.addEventListener('click', resetForm);
});

/**
 * Load all users from the API
 */
function loadUsers() {
  showLoading();
  
  fetch(API_ENDPOINTS.GET_ALL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load users');
      }
      return response.json();
    })
    .then(data => {
      renderUsersTable(data.users);
      hideLoading();
    })
    .catch(error => {
      showError('Error loading users: ' + error.message);
      hideLoading();
    });
}

/**
 * Render users table with data from API
 */
function renderUsersTable(users) {
  if (!users || users.length === 0) {
    usersList.innerHTML = '<tr><td colspan="5">No users found.</td></tr>';
    return;
  }
  
  let html = '';
  users.forEach(user => {
    html += `
      <tr>
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.created_at || ''}</td>
        <td>
          <button type="button" class="edit" onclick="editUser(${user.id})">Edit</button>
          <button type="button" class="delete" onclick="deleteUser(${user.id})">Delete</button>
        </td>
      </tr>
    `;
  });
  
  usersList.innerHTML = html;
}

/**
 * Handle form submission (create or update user)
 */
function handleFormSubmit(event) {
  event.preventDefault();
  
  const userData = {
    name: nameField.value.trim(),
    email: emailField.value.trim()
  };
  
  // Validate form data
  if (!userData.name || !userData.email) {
    showError('Name and email are required');
    return;
  }
  
  const userId = userIdField.value;
  
  if (userId) {
    // Update existing user
    updateUser(userId, userData);
  } else {
    // Create new user
    createUser(userData);
  }
}

/**
 * Create a new user via API
 */
function createUser(userData) {
  showLoading();
  
  fetch(API_ENDPOINTS.CREATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      return response.json();
    })
    .then(data => {
      showMessage('User created successfully');
      resetForm();
      loadUsers();
    })
    .catch(error => {
      showError('Error creating user: ' + error.message);
      hideLoading();
    });
}

/**
 * Load user data for editing
 */
function editUser(userId) {
  showLoading();
  
  fetch(API_ENDPOINTS.GET_ONE + userId)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load user');
      }
      return response.json();
    })
    .then(data => {
      // Populate form with user data
      userIdField.value = data.user.id;
      nameField.value = data.user.name;
      emailField.value = data.user.email;
      
      // Update form UI for edit mode
      formTitle.textContent = 'Edit User';
      saveButton.textContent = 'Update User';
      cancelButton.style.display = 'inline-block';
      
      hideLoading();
      // Scroll to form
      userForm.scrollIntoView({ behavior: 'smooth' });
    })
    .catch(error => {
      showError('Error loading user: ' + error.message);
      hideLoading();
    });
}

/**
 * Update an existing user via API
 */
function updateUser(userId, userData) {
  showLoading();
  
  fetch(API_ENDPOINTS.UPDATE + userId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      return response.json();
    })
    .then(data => {
      showMessage('User updated successfully');
      resetForm();
      loadUsers();
    })
    .catch(error => {
      showError('Error updating user: ' + error.message);
      hideLoading();
    });
}

/**
 * Delete a user via API
 */
function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) {
    return;
  }
  
  showLoading();
  
  fetch(API_ENDPOINTS.DELETE + userId, {
    method: 'DELETE'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      return response.json();
    })
    .then(data => {
      showMessage('User deleted successfully');
      loadUsers();
    })
    .catch(error => {
      showError('Error deleting user: ' + error.message);
      hideLoading();
    });
}

/**
 * Reset form to create mode
 */
function resetForm() {
  userForm.reset();
  userIdField.value = '';
  formTitle.textContent = 'Add New User';
  saveButton.textContent = 'Save User';
  cancelButton.style.display = 'none';
  hideMessage();
  hideError();
}

/**
 * UI Helper Functions
 */
function showMessage(text) {
  messageDiv.textContent = text;
  messageDiv.style.display = 'block';
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}

function hideMessage() {
  messageDiv.style.display = 'none';
}

function showError(text) {
  errorDiv.textContent = text;
  errorDiv.style.display = 'block';
}

function hideError() {
  errorDiv.style.display = 'none';
}

function showLoading() {
  loadingDiv.style.display = 'block';
}

function hideLoading() {
  loadingDiv.style.display = 'none';
}

