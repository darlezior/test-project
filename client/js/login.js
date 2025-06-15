// client/js/login.js

import { startGame } from './game.js';
import { log } from './logger.js';
import './joystick.js'; // Inizializza il joystick
import { showCharSelect } from './charSelect.js';

const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const btnLogin = document.getElementById('btnLogin');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginMessage = document.getElementById('login-message');

// Funzione per pulire messaggi di errore
function clearMessage() {
  loginMessage.textContent = '';
}

// Aggiungo un listener anche al tasto Invio per facilità d'uso
usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnLogin.click();
});
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnLogin.click();
});

btnLogin.addEventListener('click', async () => {
  clearMessage();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  log(`Tentativo login con username: "${username}"`);

  if (!username || !password) {
    loginMessage.textContent = 'Inserisci username e password';
    log('❌ Username o password mancanti');
    return;
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      log(`✅ Login riuscito per ${username}`);
      loginScreen.style.display = 'none';
      // MOSTRA SCHERMATA SELEZIONE PERSONAGGI, passandogli userId che ti deve ritornare il login
      showCharSelect(data.userId);
    } else {
      loginMessage.textContent = data.message || 'Errore login';
      log(`❌ Login fallito: ${data.message || 'Errore generico'}`);
    }
  } catch (err) {
    loginMessage.textContent = 'Errore di rete o server';
    log(`❌ Errore rete durante il login: ${err.message || err}`);
  }
});
