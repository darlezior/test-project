// grid.js - disegno e gestione interazione con la griglia mappa

import { currentMap, updateMap } from './maps.js';

const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 32;

let selectedCellType = 'empty';

// Colori base per tipi cella
const cellColors = {
  empty: '#eee',
  grass: '#7cfc00',
  water: '#1e90ff',
  mountain: '#a9a9a9',
  forest: '#228b22',
};

// Imposta il tipo cella selezionato da UI
export function setSelectedCellType(type) {
  selectedCellType = type;
}

// Disegna l’intera mappa nel canvas
export function drawMap(map) {
  if (!map) return;

  const widthPx = map.width * CELL_SIZE;
  const heightPx = map.height * CELL_SIZE;

  canvas.width = widthPx;
  canvas.height = heightPx;

  // Background
  ctx.clearRect(0, 0, widthPx, heightPx);

  // Disegna celle
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const cell = map.cells[y][x];
      ctx.fillStyle = cellColors[cell.type] || '#fff';
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

      // Bordo cella
      ctx.strokeStyle = '#ccc';
      ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

// Modifica cella cliccata con tipo selezionato
function onCanvasClick(event) {
  if (!currentMap) return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((event.clientY - rect.top) / CELL_SIZE);

  if (x < 0 || x >= currentMap.width || y < 0 || y >= currentMap.height) return;

  currentMap.cells[y][x].type = selectedCellType;

  drawMap(currentMap);
}

// Evento click
canvas.addEventListener('click', onCanvasClick);
