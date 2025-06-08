// server/map/mapManager.js
import MapCell from '../models/mapCell.js';

const mapCache = {};

export async function getMapData(mapName, width = 20, height = 15) {
  if (mapCache[mapName]) return mapCache[mapName];

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
