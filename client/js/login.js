// client/js/login.js

import { startGame } from './game.js';
import { log } from './logger.js';
import './joystick.js'; // ✅ Assicura che il joystick venga inizializzato

const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const btnLogin = document.getElementById('btnLogin');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginMessage = document.getElementById('login-message');

btnLogin.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  log(`Tentativo login con username: "${username}"`);

  if (!username || !password) {
    loginMessage.textContent = 'Inserisci username e password';
    log('❌  Username o password mancanti');
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
      log(`✅  Login riuscito per ${username}`);
      loginScreen.style.display = 'none';
      gameScreen.style.display = 'block';
      startGame(username);
    } else {
      loginMessage.textContent = data.message || 'Errore login';
      log(`❌  Login fallito: ${data.message || 'Errore generico'}`);
    }

  } catch (err) {
    loginMessage.textContent = 'Errore di rete';
    log(`❌  Errore rete durante il login: ${err}`);
  }
});
