const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const tileSize = 32;
const rows = canvas.height / tileSize;
const cols = canvas.width / tileSize;

// Disegna griglia
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#ccc';
  for (let x = 0; x <= cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * tileSize, 0);
    ctx.lineTo(x * tileSize, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * tileSize);
    ctx.lineTo(canvas.width, y * tileSize);
    ctx.stroke();
  }
}

// Aggiungi click per loggare le coordinate
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / tileSize);
  const y = Math.floor((e.clientY - rect.top) / tileSize);
  alert(`Hai cliccato su x: ${x}, y: ${y}`);
});

drawGrid();
