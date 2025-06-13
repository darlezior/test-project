// grid.js – Crea e gestisce la griglia visiva nel map editor con supporto layer

import { getActiveLayer } from './ui.js';
const selectedItemSymbol = document.getElementById('selectedItemSymbol');

/**
 * Dati della mappa per i due layer
 * Ogni elemento è un array di oggetti { x, y, value }
 */
let backgroundData = [];
let objectsData = [];

/**
 * Crea la griglia HTML per la mappa
 * @param {number} width - larghezza mappa
 * @param {number} height - altezza mappa
 * @param {Object} data - dati esistenti { background: [], objects: [] }
 */
export function createGrid(width, height, data = { background: [], objects: [] }) {
  const container = document.getElementById('gridContainer');
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${width}, 20px)`;
  container.style.gridTemplateRows = `repeat(${height}, 20px)`;

  // Salva i dati o inizializza vuoti
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

      if (bgMatch) {
        cell.classList.add('background-active');
        insertVisual(cell, bgMatch.value);
      } else if (objMatch) {
        cell.classList.add('object-active');
        insertVisual(cell, objMatch.value);
      } else {
        cell.textContent = '.';
      }

      cell.addEventListener('click', () => {
        const activeLayer = getActiveLayer(); // "sfondo" o "oggetti"
        const selectedSymbol = selectedItemSymbol?.textContent || 'X';
        console.log(`Clic su cella (${x},${y}) - Layer: ${activeLayer} - Valore inserito: ${selectedSymbol}`);
        const key = activeLayer === 'background' ? 'background' : 'objects';
        const layerData = key === 'background' ? backgroundData : objectsData;
        const otherData = key === 'background' ? objectsData : backgroundData;
        const activeClass = key === 'background' ? 'background-active' : 'object-active';
        const otherClass = key === 'background' ? 'object-active' : 'background-active';

        const index = layerData.findIndex((c) => c.x === x && c.y === y);
        if (index !== -1) {
          // Rimuovi dal layer attivo
          layerData.splice(index, 1);
          cell.classList.remove(activeClass);
          cell.innerHTML = '.';
        } else {
          // Aggiungi al layer attivo
          layerData.push({ x, y, value: selectedSymbol });
          cell.classList.add(activeClass);
          insertVisual(cell, selectedSymbol);
        }

        // Rimuovi dal layer opposto se presente (non possono coesistere)
        const otherIndex = otherData.findIndex((c) => c.x === x && c.y === y);
        if (otherIndex !== -1) {
          otherData.splice(otherIndex, 1);
          cell.classList.remove(otherClass);
        }
      });

      container.appendChild(cell);
    }
  }
}

/**
 * Inserisce un'immagine o testo in una cella
 * @param {HTMLElement} cell
 * @param {string} value - simbolo o URL immagine
 */
function insertVisual(cell, value) {
  cell.innerHTML = '';
  if (
    value.endsWith('.png') ||
    value.endsWith('.jpg') ||
    value.startsWith('/uploads/')
  ) {
    const img = document.createElement('img');
    img.src = value;
    img.alt = 'Oggetto';
    img.width = 20;
    img.height = 20;
    img.title = value.split('/').pop(); // Tooltip con nome file
    cell.appendChild(img);
  } else {
    cell.textContent = value;
  }
}

/**
 * Estrae i dati della griglia per il salvataggio
 * Restituisce un oggetto con due array separati per layer
 * @returns {Object} { background: Array, objects: Array }
 */
export function extractGridData() {
  return {
    background: [...backgroundData],
    objects: [...objectsData],
  };
}
