// server/map/mapManager.js
import { MapCell } from '../models/mapCell.js';

// Cache delle mappe in memoria: { mapName: [celle] }
const mapCache = {};

/**
 * Recupera i dati di una mappa dal database o dalla cache.
 * Se la mappa non esiste, viene generata una nuova mappa "vuota" con celle di tipo 'grass'.
 * @param {string} mapName - Nome della mappa (es. 'start', 'forest-1')
 * @param {number} width - Larghezza mappa in celle (default 20)
 * @param {number} height - Altezza mappa in celle (default 15)
 * @returns {Promise<Array>} Array di celle della mappa
 */
export async function getMapData(mapName, width = 20, height = 15) {
  if (mapCache[mapName]) {
    return mapCache[mapName];
  }
  const cells = await MapCell.find({ mapName });
  if (cells.length === 0) {
    console.log(`Generazione nuova mappa "${mapName}"...`);
    const newCells = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        newCells.push({ mapName, x, y, type: 'grass' });
      }
    }
    await MapCell.insertMany(newCells);
    mapCache[mapName] = newCells;
    return newCells;
  }
  mapCache[mapName] = cells;
  return cells;
}

/**
 * Aggiorna una singola cella della mappa sia nel database che nella cache.
 * @param {string} mapName - Nome della mappa
 * @param {number} x - Coordinata X della cella
 * @param {number} y - Coordinata Y della cella
 * @param {Object} updateData - Dati da aggiornare nella cella
 * @returns {Promise<Object>} Cella aggiornata
 */
export async function updateMapCell(mapName, x, y, updateData) {
  const updatedCell = await MapCell.findOneAndUpdate(
    { mapName, x, y },
    updateData,
    { new: true, upsert: true }
  );

  // Aggiorno cache
  if (mapCache[mapName]) {
    const idx = mapCache[mapName].findIndex(c => c.x === x && c.y === y);
    if (idx !== -1) {
      mapCache[mapName][idx] = updatedCell;
    } else {
      mapCache[mapName].push(updatedCell);
    }
  }
  return updatedCell;
}

/**
 * Svuota la cache per una mappa specifica o per tutte (se mapName è omesso).
 * Utile per ricaricare dati dopo modifiche esterne.
 * @param {string} [mapName]
 */
export function clearMapCache(mapName) {
  if (mapName) {
    delete mapCache[mapName];
  } else {
    Object.keys(mapCache).forEach(key => delete mapCache[key]);
  }
}
