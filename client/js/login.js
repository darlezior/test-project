// /root/mmo/client/js/login.js
import { startGame } from './game.js';

const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const btnLogin = document.getElementById('btnLogin');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginMessage = document.getElementById('login-message');

btnLogin.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    loginMessage.textContent = 'Inserisci username e password';
    return;
  }

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (data.success) {
      loginScreen.style.display = 'none';
      gameScreen.style.display = 'block';
      startGame(username);
    } else {
      loginMessage.textContent = data.message || 'Errore login';
    }
  } catch {
    loginMessage.textContent = 'Errore di rete';
  }
});
