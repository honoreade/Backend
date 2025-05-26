  // DOM Elements
document.addEventListener("DOMContentLoaded", () => {
  const userForm = document.getElementById('user-form');
  const usersList = document.getElementById('users-list');
  const formTitle = document.getElementById('form-title');
  const userId = document.getElementById('user-id');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const saveButton = document.getElementById('save-button');
  const cancelButton = document.getElementById('cancel-button');
  const messageDiv = document.getElementById('message');
  const errorDiv = document.getElementById('error');
  const loadingDiv = document.getElementById('loading');
  // Load all users

  loadUsers();
  // Event Listeners

  userForm.addEventListener('submit', handleFormSubmit);
  cancelButton.addEventListener('click', resetForm);
  // Functions

  function loadUsers() {

    showLoading(true);
    fetch('/users')
      .then(response => response.json())
      .then(users => {
        renderUsers(users);
        showLoading(false);
      })
      .catch(error => {
        showError('Failed to load users: ' + error.message);
        showLoading(false);
      });
  }

    if (users.length === 0) {
      usersList.innerHTML = '<tr><td colspan="5">No users found</td></tr>';
      return;
    }

    usersList.innerHTML = '';

  function renderUsers(users) {
    users.forEach(user => {

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${escapeHtml(user.name)}</td>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.created_at)}</td>
        <td>
          <button type="button" class="edit" data-id="${user.id}">Edit</button>
          <button type="button" class="delete" data-id="${user.id}">Delete</button>
        </td>

      `;

      // Add event listeners to the buttons
      usersList.appendChild(row);
      row.querySelector('.edit').addEventListener('click', () => editUser(user.id));
      row.querySelector('.delete').addEventListener('click', () => deleteUser(user.id));
    });
  }

  function handleFormSubmit(event) {

    event.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const id = userId.value;

    if (!name || !email) {
      showError('Name and email are required');
      return;
    }


    const userData = { name, email };
    showLoading(true);
    if (id) {
      // Update existing user
      updateUser(id, userData);
    } else {
      // Create new user
      createUser(userData);
    }


  }
  function createUser(userData) {
    fetch('/users/new', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(userData)
    })
        if (!response.ok) {
          throw new Error('Server returned ' + response.status);
        }
      .then(response => {
        return response;
      })
      .then(() => {
        showMessage('User created successfully');
        resetForm();
        loadUsers();
      })
      .catch(error => showError('Failed to create user: ' + error.message))
      .finally(() => showLoading(false));
  }

  function updateUser(id, userData) {
    fetch(`/user/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
        if (!response.ok) {
          throw new Error('Server returned ' + response.status);
        }
      .then(response => {
        return response.json();
      })
      .then(() => {
        showMessage('User updated successfully');
        resetForm();
        loadUsers();
      })
      .catch(error => showError('Failed to update user: ' + error.message))
      .finally(() => showLoading(false));
  }

  function editUser(id) {

    showLoading(true);
    fetch(`/user/${id}`)
        if (!response.ok) {
          throw new Error('Server returned ' + response.status);
        }
      .then(response => {
        return response.json();
      })
        // Populate the form
      .then(user => {
        userId.value = user.id;
        nameInput.value = user.name;

        // Update UI
        emailInput.value = user.email;
        formTitle.textContent = 'Edit User';
        saveButton.textContent = 'Update User';

        cancelButton.style.display = 'inline-block';
        showLoading(false);
      })
      .catch(error => {
        showError('Failed to load user: ' + error.message);
        showLoading(false);
      });
  }

  function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;


    fetch(`/user/delete/${id}`, {
      method: 'DELETE'
    })
    showLoading(true);
        if (!response.ok) {
          throw new Error('Server returned ' + response.status);
        }
        // Assuming the server returns JSON upon successful deletion.  If not, adjust accordingly.
      .then(response => {
        return response.json();
      })
      .then(() => {
        showMessage('User deleted successfully');
        loadUsers();
      })
      .catch(error => showError('Failed to delete user: ' + error.message))
      .finally(() => showLoading(false));
  }

  function resetForm() {
    userForm.reset();
    userId.value = '';
    formTitle.textContent = 'Add New User';
    saveButton.textContent = 'Save User';
    cancelButton.style.display = 'none';
  }

  function showMessage(text) {
    messageDiv.textContent = text;
    messageDiv.style.display = 'block';

    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 3000);
    errorDiv.style.display = 'none';
  }

  function showError(text) {
    errorDiv.textContent = text;
    errorDiv.style.display = 'block';

    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
    messageDiv.style.display = 'none';
  }

  function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
        nameInput.value = user.name;

        // Update UI
        emailInput.value = user.email;
        formTitle.textContent = 'Edit User';
        saveButton.textContent = 'Update User';
        cancelButton.style.display = 'inline-block';
        showLoading(false);
      })
      .catch(error => {
        showError('Failed to load user: ' + error.message);
        showLoading(false);
      });
  }




  function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    showLoading(true);
    fetch(`/user/delete/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Server returned ' + response.status);
        }
        // Assuming the server returns JSON upon successful deletion.  If not, adjust accordingly.
        return response.json();
      })
      .then(() => {
        showMessage('User deleted successfully');
        loadUsers();
      })
      .catch(error => showError('Failed to delete user: ' + error.message))
      .finally(() => showLoading(false));
  }

  function resetForm() {
    userForm.reset();
    userId.value = '';
    formTitle.textContent = 'Add New User';
    saveButton.textContent = 'Save User';
    cancelButton.style.display = 'none';
  }











  function showMessage(text) {
    messageDiv.textContent = text;
    messageDiv.style.display = 'block';
    setTimeout(() => {



      messageDiv.style.display = 'none';
    }, 3000);
    errorDiv.style.display = 'none';
  }



  function showError(text) {
    errorDiv.textContent = text;
    errorDiv.style.display = 'block';

    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
    messageDiv.style.display = 'none';
  }





  function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
  }
});

