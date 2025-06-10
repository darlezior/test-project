// init.js - Inizializzazione eventi, gestione click su canvas e avvio

// Click su canvas: ottiene coordinate tile e aggiorna i campi input
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / tileSize);
  const y = Math.floor((e.clientY - rect.top) / tileSize);

  document.querySelector('input[name="x"]').value = x;
  document.querySelector('input[name="y"]').value = y;
});

// Associa pulsanti e form ai rispettivi handler
document.getElementById('loadBtn').addEventListener('click', loadItems);
document.getElementById('addForm').addEventListener('submit', addItem);
document.getElementById('createMapForm').addEventListener('submit', createMap);

// ⚠️ Niente drawGrid() diretto: la griglia viene ora aggiornata dinamicamente da updateGridSize(width, height)
// La prima chiamata utile a updateGridSize() avviene in maps.js → loadMapList() → loadItems() → recupera dimensioni → updateGridSize(...)
