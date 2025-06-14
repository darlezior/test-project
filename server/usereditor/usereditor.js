const userListEl = document.getElementById('userList');
const form = document.getElementById('userForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');
const clearBtn = document.getElementById('clearBtn');
const msgEl = document.getElementById('msg');

let selectedUser = null;

async function fetchUsers() {
  try {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Errore caricamento utenti');
    const users = await res.json();
    renderUserList(users);
  } catch (err) {
    showMessage(err.message, true);
  }
}

function renderUserList(users) {
  userListEl.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user.username;
    li.dataset.username = user.username;
    li.addEventListener('click', () => selectUser(user));
    userListEl.appendChild(li);
  });
}

function selectUser(user) {
  selectedUser = user;
  usernameInput.value = user.username;
  passwordInput.value = '';
  updateSelectionUI();
  deleteBtn.disabled = false;
  saveBtn.textContent = 'Aggiorna';
  showMessage('');
}

function updateSelectionUI() {
  [...userListEl.children].forEach(li => {
    li.classList.toggle('selected', li.dataset.username === selectedUser?.username);
  });
}

function clearForm() {
  selectedUser = null;
  usernameInput.value = '';
  passwordInput.value = '';
  deleteBtn.disabled = true;
  saveBtn.textContent = 'Crea';
  updateSelectionUI();
  showMessage('');
}

function showMessage(msg, isError = false) {
  msgEl.textContent = msg;
  msgEl.style.color = isError ? 'red' : 'green';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username) {
    showMessage('Username è obbligatorio', true);
    return;
  }

  try {
    if (selectedUser) {
      // Aggiorna utente
      const res = await fetch(`/api/users/${selectedUser.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Errore aggiornamento utente');
      showMessage('Utente aggiornato con successo');
    } else {
      // Crea nuovo utente
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Errore creazione utente');
      showMessage('Utente creato con successo');
    }
    clearForm();
    fetchUsers();
  } catch (err) {
    showMessage(err.message, true);
  }
});

deleteBtn.addEventListener('click', async () => {
  if (!selectedUser) return;
  if (!confirm(`Sei sicuro di eliminare l'utente "${selectedUser.username}"?`)) return;

  try {
    const res = await fetch(`/api/users/${selectedUser.username}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Errore eliminazione utente');
    showMessage('Utente eliminato con successo');
    clearForm();
    fetchUsers();
  } catch (err) {
    showMessage(err.message, true);
  }
});

clearBtn.addEventListener('click', () => {
  clearForm();
});

fetchUsers();
