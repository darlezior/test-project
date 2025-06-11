// ?? Crea la griglia HTML
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
        if (cell.classList.contains('active')) {
          cell.classList.remove('active');
          cell.textContent = '.';
        } else {
          cell.classList.add('active');
          cell.textContent = 'X';
        }
      });

      container.appendChild(cell);
    }
  }
}

export function extractGridData() {
  const cells = document.querySelectorAll('.cell.active');
  return Array.from(cells).map((cell) => ({
    x: parseInt(cell.dataset.x),
    y: parseInt(cell.dataset.y),
    value: cell.textContent,
  }));
}
