// grid.js – Crea e gestisce la griglia visiva nel map editor con supporto layer
import { getActiveLayer } from './ui.js';
const selectedItemSymbol = document.getElementById('selectedItemSymbol');
let backgroundData = [];
let objectsData = [];

// Visibilità layers
const toggleBackground = document.getElementById('toggleBackground');
const toggleObjects = document.getElementById('toggleObjects');

export function initLayerVisibilityToggles() {
  if (!toggleBackground || !toggleObjects) return;
  toggleBackground.addEventListener('change', updateLayerVisibility);
  toggleObjects.addEventListener('change', updateLayerVisibility);
  // Aggiorna visibilità al caricamento
  updateLayerVisibility();
}

function updateLayerVisibility() {
  const showBg = toggleBackground.checked;
  const showObj = toggleObjects.checked;
  const cells = document.querySelectorAll('#gridContainer .cell');
  cells.forEach(cell => {
    const bgLayer = cell.querySelector('.layer-background');
    const objLayer = cell.querySelector('.layer-object');
    if (bgLayer) bgLayer.style.display = showBg ? 'block' : 'none';
    if (objLayer) objLayer.style.display = showObj ? 'block' : 'none';
  });
}

/**
 * Crea la griglia HTML per la mappa
 * @param {number} width - larghezza mappa
 * @param {number} height - altezza mappa
 * @param {Object} data - dati esistenti { background: [], objects: [] }
 */
export function createGrid(width, height, data = { background: [], objects: [] }) {
  const container = document.getElementById('gridContainer');
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${width}, 48px)`;
  container.style.gridTemplateRows = `repeat(${height}, 48px)`;
  backgroundData = data.background || [];
  objectsData = data.objects || [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;

      const bgMatch = backgroundData.find((c) => c.x === x && c.y === y);
      const objMatch = objectsData.find((c) => c.x === x && c.y === y);

      // Crea contenitori layer
      const bgLayer = document.createElement('div');
      bgLayer.className = 'layer-background';

      const objLayer = document.createElement('div');
      objLayer.className = 'layer-object';

      if (bgMatch) {
        insertVisual(bgLayer, bgMatch.value);
        cell.classList.add('background-active');
      }
      if (objMatch) {
        insertVisual(objLayer, objMatch.value);
        cell.classList.add('object-active');
      }

      // Inserisci layer nella cella
      cell.appendChild(bgLayer);
      cell.appendChild(objLayer);

      // Event listener per click
      cell.addEventListener('click', () => {
        const activeLayer = getActiveLayer(); // "background" o "objects"
        const selectedSymbol = selectedItemSymbol?.dataset.value || selectedItemSymbol?.textContent || 'X';
        const isBackground = activeLayer === 'background';
        const layerData = isBackground ? backgroundData : objectsData;
        const activeClass = isBackground ? 'background-active' : 'object-active';
        const layerSelector = isBackground ? '.layer-background' : '.layer-object';
        const index = layerData.findIndex((c) => c.x === x && c.y === y);
        const layerDiv = cell.querySelector(layerSelector);

        if (index !== -1) {
          // Rimuovi elemento dal layer
          layerData.splice(index, 1);
          cell.classList.remove(activeClass);
          if (layerDiv) layerDiv.innerHTML = '';
        } else {
          // Aggiungi elemento al layer
          layerData.push({ x, y, value: selectedSymbol });
          cell.classList.add(activeClass);
          if (layerDiv) insertVisual(layerDiv, selectedSymbol);
        }
      });

      container.appendChild(cell);
    }
  }
}

/**
 * Inserisce un'immagine o testo in un contenitore layer
 * @param {HTMLElement} container
 * @param {string} value
 */
function insertVisual(container, value) {
  container.innerHTML = '';
  const isImage = value.match(/\.(png|jpe?g|gif|webp)$/i) || value.startsWith('/uploads/');
  if (isImage) {
    const img = document.createElement('img');
    img.src = value;
    img.alt = 'Oggetto';
    img.width = 20;
    img.height = 20;
    img.title = value.split('/').pop();
    // Assegna la classe CSS corretta
    if (container.classList.contains('layer-background')) {
      img.className = 'bg-image';
    } else if (container.classList.contains('layer-object')) {
      img.className = 'obj-image';
    }
    container.appendChild(img);
  } else {
    container.textContent = value;
  }
}

/**
 * Estrae i dati della griglia per il salvataggio
 * @returns {Object} { background: Array, objects: Array }
 */
export function extractGridData() {
  return {
    background: [...backgroundData],
    objects: [...objectsData],
  };
}
