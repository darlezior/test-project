// client/js/game.js
import { io } from "https://cdn.socket.io/4.6.1/socket.io.esm.min.js";
import { getMovementDirection, isButtonAPressed, isButtonBPressed } from './input.js';
import { getJoystickDirection } from './joystick.js';
import { log } from './logger.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let players = {};                         // Stato degli altri giocatori
let localPlayerName = '';                 // Username del giocatore locale
let localPosition = { x: 160, y: 120 };   // Posizione del giocatore locale
let localInventory = [];                  // Inventario del giocatore locale
let localSocketId = null;                 // ID del socket del giocatore locale
const socket = io();                      // Connessione al server tramite Socket.IO

// Costanti mappa
const GRID_COLS = 20;
const GRID_ROWS = 15;
const CELL_SIZE = 32;

// Rate limit posizione
let lastSentPosition = { x: null, y: null };
let lastMoveSentTime = 0;
const MOVE_SEND_INTERVAL = 200;

// Rate limit pulsanti A e B
let lastButtonATime = 0;
let lastButtonBTime = 0;
const BUTTON_COOLDOWN = 300;

// Stato visibilità inventario
let inventoryVisible = false;

/* Resize canvas dinamicamente */
function resizeCanvas() {
  const width = Math.floor(window.innerWidth / CELL_SIZE) * CELL_SIZE;
  const height = Math.floor(window.innerHeight / CELL_SIZE) * CELL_SIZE;
  canvas.width = width;
  canvas.height = height;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* Ricezione aggiornamento lista giocatori */
socket.on('connect', () => {
  localSocketId = socket.id; // Memorizza l'ID del socket locale quando il client si connette
});

socket.on('playersUpdate', (serverPlayers) => {
  players = {}; // Pulisce la lista dei giocatori
  for (const p of serverPlayers) {
    players[p.socketId] = p; // Salva il giocatore nel dizionario

    // Aggiorna solo il giocatore locale
    if (p.socketId === localSocketId) {
      localInventory = p.inventory || localInventory;  // Aggiorna inventario
      localPosition = { x: p.x, y: p.y }; // Aggiorna la posizione
      updateInventoryUI();  // Rende visibile l'inventario
    }
  }
  drawPlayers(); // Disegna tutti i giocatori
});

/* Ricezione inventario aggiornato */
socket.on('inventoryData', (inventory) => {
  if (Array.isArray(inventory)) {
    localInventory = inventory;  // Aggiorna inventario
    updateInventoryUI();  // Rende visibile l'inventario
  }
});

/* Disegna griglia mappa */
function drawMapGrid() {
  ctx.strokeStyle = '#ccc';
  for (let c = 0; c <= GRID_COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * CELL_SIZE, 0);
    ctx.lineTo(c * CELL_SIZE, GRID_ROWS * CELL_SIZE);
    ctx.stroke();
  }
  for (let r = 0; r <= GRID_ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CELL_SIZE);
    ctx.lineTo(GRID_COLS * CELL_SIZE, r * CELL_SIZE);
    ctx.stroke();
  }
}

/* Disegna tutti i giocatori */
function drawPlayers() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);  // Pulisce il canvas
  drawMapGrid();  // Disegna la griglia

  // Disegna gli altri giocatori
  for (const id in players) {
    const p = players[id];
    const isLocal = id === localSocketId;  // Controlla se è il giocatore locale
    drawCharacter(p.x, p.y, p.username, isLocal);  // Disegna il personaggio
  }
}

/* Disegna un personaggio (rettangolo corpo, cerchio testa, nome) */
function drawCharacter(x, y, username, isLocal) {
  ctx.fillStyle = isLocal ? '#00ff00' : '#0099ff';  // Colore verde per il giocatore locale
  ctx.fillRect(x - 7, y, 14, 28); // Corpo
  ctx.beginPath();  // Testa
  ctx.arc(x, y - 10, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#ffcc99';
  ctx.fill();
  // Occhi
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x - 4, y - 10, 2, 0, Math.PI * 2);
  ctx.arc(x + 4, y - 10, 2, 0, Math.PI * 2);
  ctx.fill();
  // Nome
  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(username, x, y + 30);
}

/* Loop principale */
function gameLoop() {
  const keyDir = getMovementDirection();
  const joyDir = getJoystickDirection();
  const dx = keyDir.dx || joyDir.dx;
  const dy = keyDir.dy || joyDir.dy;

  // Aggiorna posizione se c'è movimento
  if (dx !== 0 || dy !== 0) {
    localPosition.x += dx * 2;
    localPosition.y += dy * 2;

    // Limiti rispetto al canvas dinamico
    localPosition.x = Math.min(Math.max(localPosition.x, 10), canvas.width - 10);
    localPosition.y = Math.min(Math.max(localPosition.y, 10), canvas.height - 30);

    const now = Date.now();
    // Invio posizione solo se è cambiata e se sono passati almeno 200 ms
    if ((localPosition.x !== lastSentPosition.x || localPosition.y !== lastSentPosition.y) &&
        (now - lastMoveSentTime > MOVE_SEND_INTERVAL)) {
      socket.emit('move', localPosition);  // Manda la nuova posizione al server
      lastSentPosition = { ...localPosition };
      lastMoveSentTime = now;
    }
  }

  const now = Date.now();
  // Pulsante A
  if (isButtonAPressed() && now - lastButtonATime > BUTTON_COOLDOWN) {
    log('Premuto pulsante A - azione');
    socket.emit('actionA');
    lastButtonATime = now;
  }
  // Pulsante B
  if (isButtonBPressed() && now - lastButtonBTime > BUTTON_COOLDOWN) {
    log('Premuto pulsante B - indietro');
    socket.emit('actionB');
    lastButtonBTime = now;
  }

  drawPlayers();  // Disegna tutti i giocatori
  requestAnimationFrame(gameLoop);  // Loop del gioco
}

/* Aggiorna UI inventario */
function updateInventoryUI() {
  const container = document.getElementById('inventory-items');
  container.innerHTML = '';
  if (localInventory.length === 0) {
    container.innerHTML = '<div class="inventory-item">Vuoto</div>';
    return;
  }
  for (const item of localInventory) {
    const div = document.createElement('div');
    div.className = 'inventory-item';
    div.textContent = item;
    container.appendChild(div);
  }
}

/* Avvia il gioco dopo il login */
export function startGame(username) {
  localPlayerName = username;
  socket.emit('joinGame', username);  // Manda al server il nome del giocatore
  log(`Avvio gioco per utente: ${username}`);
  socket.emit('getInventory');  // Richiedi inventario al server

  // Gestione visibilità inventario
  const btnInventory = document.getElementById('btnInventory');
  const inventoryDiv = document.getElementById('inventory');
  btnInventory.addEventListener('click', () => {
    inventoryVisible = !inventoryVisible;
    inventoryDiv.style.display = inventoryVisible ? 'block' : 'none';
  });

  gameLoop();  // Inizia il loop di gioco
}
