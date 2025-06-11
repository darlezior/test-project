// ?? UI handler per il Map Editor
// Importa le funzioni per creare la griglia e gestire l'API
import { createGrid, extractGridData } from './grid.js';
import { saveMap, getMaps, loadMap } from './api.js';

// Funzione principale per gestire la UI
export function setupUI() {
  // Riferimenti agli elementi del DOM
  const form = document.getElementById('mapForm');
  const selector = document.getElementById('mapSelector');
  const loadBtn = document.getElementById('loadMapBtn');

  // Evento per il salvataggio della mappa
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('mapName').value;
    const width = parseInt(document.getElementById('mapWidth').value);
    const height = parseInt(document.getElementById('mapHeight').value);
    const grid = extractGridData();

    console.log('Salvataggio mappa:', { name, width, height, grid });

    try {
      const res = await saveMap({ name, width, height, grid });
      alert(res.message);
      await loadMapList(); // Ricarica la lista dopo il salvataggio
    } catch (error) {
      console.error('Errore durante il salvataggio della mappa:', error);
    }
  });

  // Evento per il caricamento di una mappa selezionata
  loadBtn.addEventListener('click', async () => {
    const name = selector.value;
    if (!name) {
      alert('Seleziona una mappa da caricare.');
      return;
    }

    console.log('Caricamento mappa:', name);

    try {
      const map = await loadMap(name);
      document.getElementById('mapName').value = map.name;
      document.getElementById('mapWidth').value = map.width;
      document.getElementById('mapHeight').value = map.height;
      createGrid(map.width, map.height, map.grid);
    } catch (error) {
      console.error('Errore durante il caricamento della mappa:', error);
    }
  });

  // Carica la lista delle mappe disponibili e popola il dropdown
  async function loadMapList() {
    console.log('Caricamento lista mappe...');
    try {
      const maps = await getMaps(); // array di stringhe come ["testmap", "mappa1"]
      console.log('Mappe disponibili:', maps);

      // Costruisce il menu a tendina usando i nomi direttamente
      selector.innerHTML = maps
        .map((name) => `<option value="${name}">${name}</option>`)
        .join('');
    } catch (error) {
      console.error('Errore durante il caricamento della lista mappe:', error);
    }
  }

  // Caricamento iniziale della lista
  loadMapList();
}
