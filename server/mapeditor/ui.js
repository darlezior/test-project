// ✅ ui.js – Gestione dell'interfaccia utente del Map Editor
import { createGrid, extractGridData } from './grid.js';
import {
  saveMap, getMaps, loadMap,
  getItems, createItem, updateItem, deleteItem,
  uploadImage, getImages, deleteImage
} from './api.js';

let activeLayer = 'objects'; // Default

export function getActiveLayer() {
  return activeLayer;
}

export function setupUI() {
  const form = document.getElementById('mapForm');
  const selector = document.getElementById('mapSelector');
  const loadBtn = document.getElementById('loadMapBtn');
  const itemForm = document.getElementById('addForm');
  const itemList = document.getElementById('itemsList');
  const selectedPreview = document.getElementById('selectedItemPreview');
  const imageUploader = document.getElementById('imageUploader');
  const imageList = document.getElementById('imageList');
  const selectedItemName = document.getElementById('selectedItem');
  const selectedItemSymbol = document.getElementById('selectedItemSymbol');

  let currentItem = null;

  // ✅ Caricamento lista immagini
  async function loadImageList() {
    const images = await getImages();
    imageList.innerHTML = '';
    images.forEach(img => {
      const wrapper = document.createElement('div');
      wrapper.className = 'image-wrapper';

      const image = document.createElement('img');
      image.src = `/uploads/${img}`;
      image.alt = img;
      image.title = 'Clicca per selezionare';
      image.className = 'image-preview';

      image.addEventListener('click', () => {
        currentItem = { name: img, symbol: `/uploads/${img}` };
        selectedItemName.textContent = img;
        selectedItemSymbol.textContent = '[immagine]';
        itemForm.symbol.value = `/uploads/${img}`;
        if (selectedPreview) {
          selectedPreview.src = `/uploads/${img}`;
          selectedPreview.style.display = 'block';
        }
        showNotification(`Immagine selezionata: ${img}`);
      });

      const delBtn = document.createElement('button');
      delBtn.textContent = '❌';
      delBtn.className = 'delete-image';
      delBtn.addEventListener('click', async (ev) => {
        ev.stopPropagation();
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

  // ✅ Upload immagine
  imageUploader.addEventListener('change', async () => {
    const file = imageUploader.files[0];
    if (!file) return;
    try {
      await uploadImage(file);
      await loadImageList();
      imageUploader.value = '';
      showNotification(`Immagine caricata: ${file.name}`);
    } catch (err) {
      console.error('Errore upload immagine:', err);
      showNotification(`Errore caricamento immagine`);
    }
  });

  // ✅ Salvataggio mappa
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('mapName').value;
    const width = parseInt(document.getElementById('mapWidth').value);
    const height = parseInt(document.getElementById('mapHeight').value);
    const layers = extractGridData(); // { background: [...], objects: [...] }

    try {
      const res = await saveMap({ name, width, height, layers });
      showNotification(res.message);
      await loadMapList();
    } catch (error) {
      console.error('Errore durante il salvataggio della mappa:', error);
    }
  });

  // ✅ Caricamento mappa
  loadBtn.addEventListener('click', async () => {
    const name = selector.value;
    if (!name) return alert('Seleziona una mappa da caricare.');
    try {
      const map = await loadMap(name);
      document.getElementById('mapName').value = map.name;
      document.getElementById('mapWidth').value = map.width;
      document.getElementById('mapHeight').value = map.height;
      createGrid(map.width, map.height, map.layers);
    } catch (error) {
      console.error('Errore durante il caricamento della mappa:', error);
    }
  });

  // ✅ Lista mappe
  async function loadMapList() {
    try {
      const maps = await getMaps();
      selector.innerHTML = maps.map(name =>
        `<option value="${name}">${name}</option>`).join('');
    } catch (error) {
      console.error('Errore caricamento lista mappe:', error);
    }
  }

  // ✅ Lista oggetti
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
          selectedItemName.textContent = item.name;
          selectedItemSymbol.textContent = item.symbol;
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
      console.error('Errore caricamento oggetti:', err);
    }
  }

  // ✅ Crea / aggiorna oggetto
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
      console.error('Errore salvataggio oggetto:', err);
    }
  });

  // ✅ Selettore layer (background / oggetti)
  function setupLayerSelector() {
    const radios = document.querySelectorAll('input[name="layer"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          activeLayer = radio.value;
          showNotification(`Layer attivo: ${activeLayer}`);
        }
      });
      if (radio.checked) {
        activeLayer = radio.value;
      }
    });
  }

  // ✅ Notifica temporanea
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.background = '#28a745';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.marginTop = '10px';
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.zIndex = 1000;
    notification.style.borderRadius = '4px';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  // ✅ Inizializzazione
  loadMapList();
  loadItemList();
  loadImageList();
  setupLayerSelector();
}
