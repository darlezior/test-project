// ✅  ui.js – Gestione dell'interfaccia utente del Map Editor
import { createGrid, extractGridData } from './grid.js';
import {
  saveMap, getMaps, loadMap,
  getItems, createItem, updateItem, deleteItem,
  uploadImage, getImages, deleteImage
} from './api.js';

export function setupUI() {
  const form = document.getElementById('mapForm');
  const selector = document.getElementById('mapSelector');
  const loadBtn = document.getElementById('loadMapBtn');
  const itemForm = document.getElementById('addForm');
  const itemList = document.getElementById('itemsList');
  const selectedPreview = document.getElementById('selectedItemPreview');
  let currentItem = null;

  // ✅  Elementi UI per la gestione immagini oggetti
  const imageUploader = document.getElementById('imageUploader');
  const imageList = document.getElementById('imageList');

  // ✅  Caricamento immagini disponibili
  async function loadImageList() {
    const images = await getImages();
    imageList.innerHTML = '';
    images.forEach(img => {
      const wrapper = document.createElement('div');
      wrapper.style.border = '1px solid #ccc';
      wrapper.style.padding = '4px';
      wrapper.style.textAlign = 'center';
      wrapper.style.width = '80px';
      wrapper.style.margin = '4px';
      wrapper.style.display = 'inline-block';

      const image = document.createElement('img');
      image.src = `/uploads/${img}`;
      image.alt = img;
      image.title = 'Clicca per selezionare';
      image.style.width = '64px';
      image.style.height = '64px';
      image.style.cursor = 'pointer';
      image.addEventListener('click', () => {
        currentItem = { name: img, symbol: `/uploads/${img}` };
        document.getElementById('selectedItem').textContent = img;
        document.getElementById('selectedItemSymbol').textContent = '[immagine]';
        itemForm.symbol.value = `/uploads/${img}`;
        if (selectedPreview) {
          selectedPreview.src = `/uploads/${img}`;
          selectedPreview.style.display = 'block';
          selectedPreview.style.maxWidth = '64px';
          selectedPreview.style.maxHeight = '64px';
          selectedPreview.style.marginTop = '6px';
        }
        showNotification(`Immagine selezionata: ${img}`);
      });

      const delBtn = document.createElement('button');
      delBtn.textContent = '❌';
      delBtn.style.marginTop = '4px';
      delBtn.addEventListener('click', async () => {
        if (confirm(`Eliminare l'immagine "${img}"?`)) {
          try {
            await deleteImage(img);
            await loadImageList();
          } catch (err) {
            console.error('Errore eliminazione immagine:', err);
          }
        }
      });

      wrapper.appendChild(image);
      wrapper.appendChild(delBtn);
      imageList.appendChild(wrapper);
    });
  }

  // ✅  Upload immagine da file
  imageUploader.addEventListener('change', async () => {
    const file = imageUploader.files[0];
    if (!file) return;
    try {
      await uploadImage(file);
      await loadImageList();
      imageUploader.value = ''; // reset input file
      showNotification(`Immagine caricata: ${file.name}`);
    } catch (err) {
      console.error('Errore upload immagine:', err);
      showNotification(`Errore caricamento immagine`);
    }
  });

  // ✅  Salvataggio mappa
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('mapName').value;
    const width = parseInt(document.getElementById('mapWidth').value);
    const height = parseInt(document.getElementById('mapHeight').value);
    const grid = extractGridData();
    try {
      const res = await saveMap({ name, width, height, grid });
      showNotification(res.message);
      await loadMapList();
    } catch (error) {
      console.error('Errore durante il salvataggio della mappa:', error);
    }
  });

  // ✅  Caricamento mappa selezionata
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

  // ✅  Caricamento elenco mappe
  async function loadMapList() {
    try {
      const maps = await getMaps();
      selector.innerHTML = maps.map(name =>
        `<option value="${name}">${name}</option>`).join('');
    } catch (error) {
      console.error('Errore durante il caricamento della lista mappe:', error);
    }
  }

  // ✅  Caricamento elenco oggetti
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
          itemForm.symbol.value = item.symbol;
          if (selectedPreview) {
            selectedPreview.src = item.symbol;
            selectedPreview.style.display = 'block';
          }
          showNotification(`Oggetto selezionato: ${item.name}`);
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
            try {
              await deleteItem(item._id);
              await loadItemList();
            } catch (err) {
              console.error('Errore eliminazione oggetto:', err);
            }
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

  // ✅  Gestione creazione / aggiornamento oggetto
  itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = itemForm.name.value;
    const symbol = itemForm.symbol.value;
    const id = itemForm.dataset.id;

    if (!symbol) {
      alert("Devi selezionare o inserire un simbolo per l'oggetto.");
      return;
    }

    try {
      if (id) {
        await updateItem(id, { name, symbol });
        delete itemForm.dataset.id;
      } else {
        await createItem({ name, symbol });
      }
      itemForm.reset();
      if (selectedPreview) selectedPreview.style.display = 'none';
      await loadItemList();
    } catch (err) {
      console.error('Errore nel salvataggio oggetto:', err);
    }
  });

  // ✅  Notifica temporanea
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.background = '#28a745';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.marginTop = '10px';
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // ✅ Inizializzazione
  loadMapList();
  loadItemList();
  loadImageList();
}
