// grid.js - Disegna la griglia sulla canvas
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const tileSize = 32;
const rows = Math.floor(canvas.height / tileSize);
const cols = Math.floor(canvas.width / tileSize);

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
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
