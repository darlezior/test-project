// ?? UI handler
import { createGrid, extractGridData } from './grid.js';
import { saveMap, getMaps, loadMap } from './api.js';

export function setupUI() {
  const form = document.getElementById('mapForm');
  const selector = document.getElementById('mapSelector');
  const loadBtn = document.getElementById('loadMapBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('mapName').value;
    const width = parseInt(document.getElementById('mapWidth').value);
    const height = parseInt(document.getElementById('mapHeight').value);
    const grid = extractGridData();
    const res = await saveMap({ name, width, height, grid });
    alert(res.message);
    loadMapList();
  });

  loadBtn.addEventListener('click', async () => {
    const name = selector.value;
    const map = await loadMap(name);
    document.getElementById('mapName').value = map.name;
    document.getElementById('mapWidth').value = map.width;
    document.getElementById('mapHeight').value = map.height;
    createGrid(map.width, map.height, map.grid);
  });

  async function loadMapList() {
  const maps = await getMaps();
  selector.innerHTML = maps.map((m) => `<option value="${m.name}">${m.name}</option>`).join('');
}

  loadMapList();
}
