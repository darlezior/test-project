// ?? grid.js – Crea e gestisce la griglia visiva nel map editor

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

      const match = data.find((c) => c.x === x && c.y === y);
      if (match) {
        cell.classList.add('active');
        insertVisual(cell, match.value);
      } else {
        cell.textContent = '.';
      }

      cell.addEventListener('click', () => {
        if (cell.classList.contains('active')) {
          cell.classList.remove('active');
          cell.innerHTML = '.';
        } else {
          const selected = document.getElementById('selectedItemSymbol');
          const symbol = selected?.textContent || 'X';
          cell.classList.add('active');
          insertVisual(cell, symbol);
        }
      });

      container.appendChild(cell);
    }
  }
}

/**
 * Inserisce un'immagine o un testo nella cella
 * @param {HTMLElement} cell - Cella HTML
 * @param {string} value - Valore da inserire (simbolo o URL immagine)
 */
function insertVisual(cell, value) {
  cell.innerHTML = '';
  if (value.endsWith('.png') || value.endsWith('.jpg') || value.startsWith('/uploads/')) {
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
 * Estrae i dati dalla griglia per salvarli (solo celle attive)
 * @returns {Array} - Array di oggetti con x, y, value
 */
export function extractGridData() {
  const cells = document.querySelectorAll('.cell.active');
  return Array.from(cells).map((cell) => {
    const img = cell.querySelector('img');
    return {
      x: parseInt(cell.dataset.x),
      y: parseInt(cell.dataset.y),
      value: img
        ? img.src.replace(window.location.origin, '') // es: http://192.168.1.107:3000/uploads/img.png → /uploads/img.png
        : cell.textContent,
    };
  });
}
