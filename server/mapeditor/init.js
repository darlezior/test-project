// ✅ Inizializzazione Map Editor
import { setupUI } from './ui.js';
import { initLayerVisibilityToggles } from './grid.js';
window.addEventListener('DOMContentLoaded', async () => {
  await setupUI(); // supporta funzioni async se necessario
});
initLayerVisibilityToggles();
