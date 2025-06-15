// client/js/charSelect.js

import { startGame } from './game.js';
import { log } from './logger.js';
import * as charApi from './charApi.js';

const charSelectScreen = document.getElementById('char-select-screen');
const charListDiv = document.getElementById('char-list');
const btnCreateChar = document.getElementById('btnCreateChar');
const btnLogoutFromCharSelect = document.getElementById('btnLogoutFromCharSelect');
const charMessage = document.getElementById('char-message');

let currentUserId = null;

export async function showCharSelect(userId) {
  currentUserId = userId;
  charMessage.textContent = '';
  charListDiv.innerHTML = '';
  charSelectScreen.style.display = 'block';

  try {
    console.log('userId usato per fetchCharacters:', userId);
    const chars = await charApi.fetchCharacters(userId);

    if (!Array.isArray(chars)) {
      throw new Error('La risposta dal server non è un array');
    }

    if (chars.length === 0) {
      charMessage.textContent = 'Nessun personaggio trovato. Crea un nuovo personaggio.';
      return;
    }

    chars.forEach(c => {
      const btn = document.createElement('button');
      btn.textContent = `${c.name} (Lv ${c.level})`;
      btn.style.display = 'block';
      btn.style.margin = '4px 0';
      btn.addEventListener('click', () => selectCharacter(c));
      charListDiv.appendChild(btn);
    });
  } catch (err) {
    charMessage.textContent = 'Errore nel caricamento dei personaggi';
    log('Errore fetchCharacters: ' + err.message);
  }
}

async function selectCharacter(character) {
  log(`Personaggio selezionato: ${character.name}`);
  charSelectScreen.style.display = 'none';
  startGame(character);
}

btnCreateChar.addEventListener('click', async () => {
  const name = prompt('Inserisci il nome del nuovo personaggio:');
  if (!name) return;

  const newCharData = {
    name,
    level: 1,
    exp: 0,
    hp: 100,
    sp: 50,
    mp: 30,
    pos: { map: 'startmap', x: 10, y: 10 }
  };

  try {
    const res = await charApi.createCharacter(currentUserId, newCharData);

    // supponendo che il server risponda con { success: true } o simile
    if (res.success) {
      log(`Personaggio creato: ${name}`);
      await showCharSelect(currentUserId); // ricarica la lista
    } else {
      charMessage.textContent = res.message || 'Errore nella creazione del personaggio';
    }
  } catch (err) {
    charMessage.textContent = 'Errore nella creazione del personaggio';
    log('Errore createCharacter: ' + err.message);
  }
});

btnLogoutFromCharSelect.addEventListener('click', () => {
  window.location.reload(); // ritorna al login ricaricando la pagina
});
