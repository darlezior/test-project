// maps.js - Gestisce la creazione, selezione e cancellazione delle mappe

// ✅ Percorso corretto per le chiamate API al backend
const API_PREFIX = '/api/maps';

// ?? Carica la lista delle mappe nella dropdown all'avvio
async function loadMapList() {
  try {
    const res = await fetch(API_PREFIX); // ✅ Chiamata corretta alle API
    if (!res.ok) throw new Error(`Errore caricamento lista mappe: ${res.status}`);
    const maps = await res.json();

    // Riempie il select con i nomi delle mappe
    const select = document.getElementById('mapSelect');
    select.innerHTML = '';
    maps.forEach(map => {
      const option = document.createElement('option');
      option.value = map.name;
      option.textContent = map.name;
      select.appendChild(option);
    });

    // Se ci sono mappe, seleziona la prima e carica i relativi elementi
    if (maps.length > 0) {
      select.value = maps[0].name;
      document.getElementById('mapName').value = maps[0].name;
      await loadItems(); // ⚠️ Assicurati che loadItems() sia definito
    }
  } catch (err) {
    alert(err.message);
  }
}

// ➕ Crea una nuova mappa inviando nome, larghezza e altezza
async function createMap(e) {
  e.preventDefault();

  // Ottiene i dati dal form
  const name = document.getElementById('newMapName').value.trim();
  const width = parseInt(document.getElementById('newMapWidth').value, 10);
  const height = parseInt(document.getElementById('newMapHeight').value, 10);

  if (!name || isNaN(width) || isNaN(height) || width < 1 || height < 1) {
    return alert('Valori non validi.');
  }

  try {
    const res = await fetch(API_PREFIX, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, width, height })
    });
    if (!res.ok) throw new Error(`Errore creazione: ${res.status}`);
    alert('Mappa creata!');

    // Reset del form e aggiornamento lista mappe
    document.getElementById('createMapForm').reset();
    await loadMapList();
    document.getElementById('mapSelect').value = name;
    document.getElementById('mapName').value = name;
    await loadItems();
  } catch (err) {
    alert(err.message);
  }
}

// ??️ Cancella la mappa selezionata
async function deleteMap() {
  const name = document.getElementById('mapSelect').value;
  if (!name) return alert('Seleziona una mappa da cancellare.');
  if (!confirm(`Sei sicuro di voler cancellare la mappa "${name}"?`)) return;

  try {
    const res = await fetch(`${API_PREFIX}/${name}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Errore cancellazione: ${res.status}`);
    alert('Mappa cancellata.');
    await loadMapList();
  } catch (err) {
    alert(err.message);
  }
}

// ?? Aggiorna input text con il nome mappa selezionata e carica i suoi elementi
function handleMapSelection() {
  const name = document.getElementById('mapSelect').value;
  document.getElementById('mapName').value = name;
  loadItems(); // ⚠️ Assicurati che loadItems() sia definito
}

// ▶️ Setup iniziale al caricamento della pagina
window.addEventListener('DOMContentLoaded', () => {
  loadMapList();
  document.getElementById('createMapForm').addEventListener('submit', createMap);
  document.getElementById('deleteMapBtn').addEventListener('click', deleteMap);
  document.getElementById('mapSelect').addEventListener('change', handleMapSelection);
});
