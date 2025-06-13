// ✅ ui.js – Gestione dell'interfaccia utente del Map Editor
import { createGrid, extractGridData } from './grid.js';
import {
  saveMap, getMaps, loadMap,
  getItems, createItem, updateItem, deleteItem,
  uploadImage, getImages, deleteImage
} from './api.js';

let activeLayer = 'objects'; // Layer di default
let currentItem = null;

export function getActiveLayer() {
  return activeLayer;
}

export function setupUI() {
  const form = document.getElementById('mapForm');
  const selector = document.getElementById('mapSelector');
  const loadBtn = document.getElementById('loadMapBtn');
  const itemForm = document.getElementById('addForm');
  const itemList = document.getElementById('itemsList');
  const imageUploader = document.getElementById('imageUploader');
  const imageList = document.getElementById('imageList');
  const selectedItemSymbol = document.getElementById('selectedItemSymbol');

  function deselectAll() {
    currentItem = null;
    itemForm.reset();
    delete itemForm.dataset.id;

    // Deseleziona tutte le immagini
    document.querySelectorAll('.image-preview.selected').forEach(img => {
      img.classList.remove('selected');
    });

    // Cancella simbolo selezionato
    if (selectedItemSymbol) {
      selectedItemSymbol.textContent = '(nessun oggetto selezionato)';
      delete selectedItemSymbol.dataset.value;
    }
  }

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
      image.style.cursor = 'pointer';

      image.addEventListener('click', () => {
        deselectAll(); // Deseleziona altri item

        currentItem = { name: img, symbol: `/uploads/${img}` };
        itemForm.symbol.value = `/uploads/${img}`;
        showNotification(`Immagine selezionata: ${img}`);

        // Valorizza simbolo selezionato
        if (selectedItemSymbol) {
          selectedItemSymbol.textContent = img;
          selectedItemSymbol.dataset.value = `/uploads/${img}`;
        }

        image.classList.add('selected');
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('mapName').value;
    const width = parseInt(document.getElementById('mapWidth').value);
    const height = parseInt(document.getElementById('mapHeight').value);
    const layers = extractGridData();
    try {
      const res = await saveMap({ name, width, height, layers });
      showNotification(res.message);
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
      createGrid(map.width, map.height, map.layers);
    } catch (error) {
      console.error('Errore durante il caricamento della mappa:', error);
    }
  });

  async function loadMapList() {
    try {
      const maps = await getMaps();
      selector.innerHTML = maps.map(name =>
        `<option value="${name}">${name}</option>`).join('');
    } catch (error) {
      console.error('Errore caricamento lista mappe:', error);
    }
  }

  async function loadItemList() {
    try {
      const items = await getItems();
      itemList.innerHTML = '';
      items.forEach((item) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.gap = '10px';
        li.dataset.id = item._id;

        const img = document.createElement('img');
        img.src = item.symbol || '';
        img.alt = item.name;
        img.style.width = '32px';
        img.style.height = '32px';
        img.style.objectFit = 'contain';
        img.style.border = '1px solid #ccc';
        img.style.borderRadius = '4px';
        img.style.cursor = 'pointer';

        img.addEventListener('click', () => {
          deselectAll(); // Deseleziona immagini
          currentItem = item;
          itemForm.symbol.value = item.symbol;
          showNotification(`Oggetto selezionato: ${item.name}`);
          if (selectedItemSymbol) {
            selectedItemSymbol.textContent = item.name;
            selectedItemSymbol.dataset.value = item.symbol;
          }
        });

        const nameSpan = document.createElement('span');
        nameSpan.textContent = item.name;
        nameSpan.style.flexGrow = '1';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Modifica';
        editBtn.addEventListener('click', () => {
          itemForm.name.value = item.name;
          itemForm.symbol.value = item.symbol;
          itemForm.dataset.id = item._id;
        });

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Elimina';
        delBtn.style.color = 'red';
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

        li.appendChild(img);
        li.appendChild(nameSpan);
        li.appendChild(editBtn);
        li.appendChild(delBtn);
        itemList.appendChild(li);
      });
    } catch (err) {
      console.error('Errore caricamento oggetti:', err);
    }
  }

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
      await loadItemList();
    } catch (err) {
      console.error('Errore salvataggio oggetto:', err);
    }
  });

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

  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '0';
    }, 2500);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Caricamento iniziale
  loadMapList();
  loadItemList();
  loadImageList();
  setupLayerSelector();
}
