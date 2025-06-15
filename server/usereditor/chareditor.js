// server/usereditor/chareditor.js

let selectedUserId = null;
let selectedCharId = null;

// Carica i personaggi per un dato utente
async function loadCharacters(userId) {
  if (!userId) return;

  if (!window.charApi) {
    console.error("charApi non è definito. Assicurati che charApi.js sia caricato prima di chareditor.js.");
    alert("Errore interno: charApi non disponibile.");
    return;
  }

  selectedUserId = userId;
  selectedCharId = null;

  try {
    const data = await window.charApi.fetchCharacters(userId);

    if (!data.success) {
      alert('Errore nel caricamento dei personaggi');
      console.error('Errore API:', data);
      return;
}

    const characters = data.characters || [];
    const list = document.getElementById('charList');
    list.innerHTML = '';
    document.getElementById('char-section').style.display = 'block';
    document.getElementById('selectedUserLabel').textContent = userId;

    characters.forEach(char => {
      const li = document.createElement('li');
      li.textContent = `${char.name} [Lvl ${char.level}]`;
      li.dataset.id = char._id;
      li.addEventListener('click', () => selectCharacter(li, char));
      list.appendChild(li);
    });

    clearCharForm();
  } catch (err) {
    console.error('Errore nel caricamento dei personaggi:', err);
    alert('Errore nel caricamento dei personaggi');
  }
}

// Gestisce la selezione di un personaggio
function selectCharacter(li, char) {
  if (!char) return;

  document.querySelectorAll('#charList li').forEach(el => el.classList.remove('selected'));
  li.classList.add('selected');

  selectedCharId = char._id;
  document.getElementById('charName').value = char.name || '';
  document.getElementById('charLevel').value = char.level || 1;
  document.getElementById('charExp').value = char.exp || 0;
  document.getElementById('charHp').value = char.hp || 100;
  document.getElementById('charSp').value = char.sp || 50;
  document.getElementById('charMp').value = char.mp || 30;
  document.getElementById('charMap').value = char.pos?.map || '';
  document.getElementById('charX').value = char.pos?.x || 0;
  document.getElementById('charY').value = char.pos?.y || 0;

  document.getElementById('charDeleteBtn').disabled = false;
}

// Pulisce il form
function clearCharForm() {
  selectedCharId = null;
  document.getElementById('charName').value = '';
  document.getElementById('charLevel').value = 1;
  document.getElementById('charExp').value = 0;
  document.getElementById('charHp').value = 100;
  document.getElementById('charSp').value = 50;
  document.getElementById('charMp').value = 30;
  document.getElementById('charMap').value = '';
  document.getElementById('charX').value = 0;
  document.getElementById('charY').value = 0;

  document.getElementById('charDeleteBtn').disabled = true;
  document.querySelectorAll('#charList li').forEach(el => el.classList.remove('selected'));
}

// Salva un nuovo personaggio o aggiorna uno esistente
async function saveCharacter(e) {
  e.preventDefault();

  const name = document.getElementById('charName').value.trim();
  const level = parseInt(document.getElementById('charLevel').value, 10);
  const exp = parseInt(document.getElementById('charExp').value, 10);
  const hp = parseInt(document.getElementById('charHp').value, 10);
  const sp = parseInt(document.getElementById('charSp').value, 10);
  const mp = parseInt(document.getElementById('charMp').value, 10);
  const map = document.getElementById('charMap').value.trim();
  const x = parseInt(document.getElementById('charX').value, 10);
  const y = parseInt(document.getElementById('charY').value, 10);

  if (!name) return alert('Inserisci un nome valido');
  if (!selectedUserId) return alert('Nessun utente selezionato');
  if (!map) return alert('Inserisci una mappa valida');

  if (!window.charApi) {
    console.error("charApi non disponibile");
    alert("Errore interno: charApi non disponibile.");
    return;
  }

  const characterData = {
    name,
    level,
    exp,
    hp,
    sp,
    mp,
    pos: { map, x, y }
  };

  try {
    if (selectedCharId) {
      await window.charApi.updateCharacter(selectedCharId, characterData);
    } else {
      await window.charApi.createCharacter(selectedUserId, characterData);
    }

    await loadCharacters(selectedUserId);
    clearCharForm();
  } catch (err) {
    console.error('Errore nel salvataggio:', err);
    alert('Errore nel salvataggio del personaggio');
  }
}

// Elimina il personaggio selezionato
async function deleteCharacter() {
  if (!selectedCharId) return;
  if (!window.charApi) {
    console.error("charApi non disponibile");
    alert("Errore interno: charApi non disponibile.");
    return;
  }

  if (!confirm('Sei sicuro di voler eliminare questo personaggio?')) return;

  try {
    await window.charApi.deleteCharacter(selectedCharId);
    await loadCharacters(selectedUserId);
    clearCharForm();
  } catch (err) {
    console.error("Errore nell'eliminazione:", err);
    alert("Errore nell'eliminazione del personaggio");
  }
}

// Event listeners
document.getElementById('charForm').addEventListener('submit', saveCharacter);
document.getElementById('charClearBtn').addEventListener('click', clearCharForm);
document.getElementById('charDeleteBtn').addEventListener('click', deleteCharacter);

// Espone la funzione globalmente per usereditor.js
window.loadCharacters = loadCharacters;
