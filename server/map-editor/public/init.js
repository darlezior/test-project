// init.js - Inizializzazione eventi e canvas

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / tileSize);
  const y = Math.floor((e.clientY - rect.top) / tileSize);
  document.querySelector('input[name="x"]').value = x;
  document.querySelector('input[name="y"]').value = y;
});

document.getElementById('loadBtn').addEventListener('click', loadItems);
document.getElementById('addForm').addEventListener('submit', addItem);
document.getElementById('createMapForm').addEventListener('submit', createMap);

// Disegna la griglia all'avvio
drawGrid();
