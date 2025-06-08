import { io } from "https://cdn.socket.io/4.6.1/socket.io.esm.min.js";
import { getMovementDirection } from './input.js';
import { getJoystickDirection } from './joystick.js';
import { log } from './logger.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let players = {};                        // Stato altri giocatori
let localPlayerName = '';               // Username locale
let localPosition = { x: 160, y: 120 }; // Posizione locale
let localInventory = [];                // Inventario locale

const socket = io();

// Ultima posizione inviata
let lastSentPosition = { x: null, y: null };
let lastMoveSentTime = 0;
const MOVE_SEND_INTERVAL = 200;

// Variabile stato inventario (aperto/chiuso)
let inventoryVisible = false;

// Evento per aggiornare la lista giocatori dal server
socket.on('playersUpdate', (serverPlayers) => {
  players = {};
  for (const p of serverPlayers) {
    if (p.socketId === socket.id) {
      // Aggiorno inventario locale se disponibile
      localInventory = p.inventory || localInventory;
      updateInventoryUI();
    } else {
      players[p.socketId] = p;
    }
  }
  drawPlayers();
});

// Ricevo dati inventario aggiornati
socket.on('inventoryData', (inventory) => {
  if (Array.isArray(inventory)) {
    localInventory = inventory;
    updateInventoryUI();
  }
});

// Disegna tutti i giocatori
function drawPlayers() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Altri giocatori
  for (const id in players) {
    const p = players[id];
    drawCharacter(p.x, p.y, p.username, false);
  }
  // Giocatore locale
  drawCharacter(localPosition.x, localPosition.y, localPlayerName, true);
}

// Disegna un singolo personaggio (semplice rettangolo + testa + nome)
function drawCharacter(x, y, username, isLocal) {
  ctx.fillStyle = isLocal ? '#00ff00' : '#0099ff';
  ctx.fillRect(x - 7, y, 14, 28);
  ctx.beginPath();
  ctx.arc(x, y - 10, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#ffcc99';
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x - 4, y - 10, 2, 0, Math.PI * 2);
  ctx.arc(x + 4, y - 10, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(username, x, y + 30);
}

// Ciclo principale di gioco: aggiorna posizione e disegna
function gameLoop() {
  const keyDir = getMovementDirection();
  const joyDir = getJoystickDirection();
  const dx = keyDir.dx || joyDir.dx;
  const dy = keyDir.dy || joyDir.dy;
  if (dx !== 0 || dy !== 0) {
    localPosition.x += dx * 2;
    localPosition.y += dy * 2;
    localPosition.x = Math.min(Math.max(localPosition.x, 10), canvas.width - 10);
    localPosition.y = Math.min(Math.max(localPosition.y, 10), canvas.height - 30);
    const now = Date.now();
    if ((localPosition.x !== lastSentPosition.x || localPosition.y !== lastSentPosition.y) &&
        (now - lastMoveSentTime > MOVE_SEND_INTERVAL)) {
      socket.emit('move', localPosition);
      lastSentPosition = { ...localPosition };
      lastMoveSentTime = now;
    }
  }
  drawPlayers();
  requestAnimationFrame(gameLoop);
}

// Aggiorna la UI dell'inventario con gli oggetti correnti
function updateInventoryUI() {
  const container = document.getElementById('inventory-items');
  container.innerHTML = ''; // Pulisce
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

// Funzione di start del gioco, chiamata dopo login
export function startGame(username) {
  localPlayerName = username;
  socket.emit('joinGame', username);
  log(`Avvio gioco per utente: ${username}`);

  // Richiedo inventario al server (eventuale)
  socket.emit('getInventory');

  // Gestore click bottone inventory: toggle visibilità
  const btnInventory = document.getElementById('btnInventory');
  const inventoryDiv = document.getElementById('inventory');
  btnInventory.addEventListener('click', () => {
    inventoryVisible = !inventoryVisible;
    inventoryDiv.style.display = inventoryVisible ? 'block' : 'none';
  });

  gameLoop();
}
