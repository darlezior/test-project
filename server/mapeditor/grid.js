// 🧱 grid.js – Crea e gestisce la griglia visiva nel map editor

/**
 * Crea la griglia HTML a partire dalle dimensioni e dai dati esistenti
 * @param {number} width - Larghezza della mappa
 * @param {number} height - Altezza della mappa
 * @param {Array} data - Dati già presenti nella mappa (opzionale)
 */
export function createGrid(width, height, data = []) {
  const container = document.getElementById('gridContainer');
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${width}, 20px)`;
  container.style.gridTemplateRows = `repeat(${height}, 20px)`;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.textContent = '.';

      const match = data.find((c) => c.x === x && c.y === y);
      if (match) {
        cell.classList.add('active');
        cell.textContent = match.value;
      }

      cell.addEventListener('click', () => {
        // Se è già attivo, si disattiva
        if (cell.classList.contains('active')) {
          cell.classList.remove('active');
          cell.textContent = '.';
        } else {
          // Se è selezionato un oggetto, usa il simbolo dell'oggetto
          const selected = document.getElementById('selectedItemSymbol');
          const symbol = selected?.textContent || 'X';
          cell.classList.add('active');
          cell.textContent = symbol;
        }
      });

      container.appendChild(cell);
    }
  }
}

/**
 * Estrae i dati dalla griglia per salvarli (solo celle attive)
 * @returns {Array} - Array di oggetti con x, y, value
 */
export function extractGridData() {
  const cells = document.querySelectorAll('.cell.active');
  return Array.from(cells).map((cell) => ({
    x: parseInt(cell.dataset.x),
    y: parseInt(cell.dataset.y),
    value: cell.textContent,
  }));
}
