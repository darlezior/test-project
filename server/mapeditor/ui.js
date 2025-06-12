// 🧩 ui.js – Gestione dell'interfaccia utente del Map Editor

import { createGrid, extractGridData } from './grid.js';
import {
  saveMap, getMaps, loadMap,
  getItems, createItem, updateItem, deleteItem
} from './api.js';

export function setupUI() {
  const form = document.getElementById('mapForm');
  const selector = document.getElementById('mapSelector');
  const loadBtn = document.getElementById('loadMapBtn');

  const itemForm = document.getElementById('addForm');
  const itemList = document.getElementById('itemsList');
  let currentItem = null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('mapName').value;
    const width = parseInt(document.getElementById('mapWidth').value);
    const height = parseInt(document.getElementById('mapHeight').value);
    const grid = extractGridData();

    try {
      const res = await saveMap({ name, width, height, grid });
      alert(res.message);
      await loadMapList();
    } catch (error) {
      console.error('Errore durante il salvataggio della mappa:', error);
    }
  });

  loadBtn.addEventListener('click', async () => {
    const name = selector.value;
    if (!name) return alert('Seleziona una mappa da caricare.');

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

  async function loadMapList() {
    try {
      const maps = await getMaps();
      selector.innerHTML = maps.map(name => `<option value="${name}">${name}</option>`).join('');
    } catch (error) {
      console.error('Errore durante il caricamento della lista mappe:', error);
    }
  }

  async function loadItemList() {
    try {
      const items = await getItems();
      itemList.innerHTML = '';
      items.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = `${item.name} (${item.symbol})`;

        const useBtn = document.createElement('button');
        useBtn.textContent = 'Usa';
        useBtn.addEventListener('click', () => {
          currentItem = item;
          document.getElementById('selectedItem').textContent = item.name;
          document.getElementById('selectedItemSymbol').textContent = item.symbol;
          alert(`Oggetto selezionato: ${item.name}`);
        });

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Modifica';
        editBtn.addEventListener('click', () => {
          itemForm.name.value = item.name;
          itemForm.symbol.value = item.symbol;
          itemForm.dataset.id = item._id;
        });

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Elimina';
        delBtn.addEventListener('click', async () => {
          if (confirm(`Eliminare l'oggetto "${item.name}"?`)) {
            await deleteItem(item._id);
            await loadItemList();
          }
        });

        li.appendChild(useBtn);
        li.appendChild(editBtn);
        li.appendChild(delBtn);
        itemList.appendChild(li);
      });
    } catch (err) {
      console.error('Errore nel caricamento oggetti:', err);
    }
  }

  itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = itemForm.name.value;
    const symbol = itemForm.symbol.value;
    const id = itemForm.dataset.id;

    try {
      if (id) {
        await updateItem(id, { name, symbol });
        delete itemForm.dataset.id;
      } else {
        await createItem({ name, symbol });
      }
      itemForm.reset();
      await loadItemList();
    } catch (err) {
      console.error('Errore nel salvataggio oggetto:', err);
    }
  });

  loadMapList();
  loadItemList();
}
