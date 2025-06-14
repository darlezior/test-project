// client/js/game.js

//import { io } from "/socket.io/socket.io.js"; // se serve esplicito import socket.io-client

// Inizializza la connessione socket.io
const socket = io();

let localSocketId = null;  // id socket locale assegnato dal server
let username = '';         // username del giocatore corrente
let players = {};          // tutti i giocatori connessi
let currentMap = [];       // griglia della mappa corrente

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const CELL_SIZE = 32;

/**
 * Funzione per iniziare il gioco, chiamata da login.js
 * @param {string} user - username del giocatore appena loggato
 */
export function startGame(user) {
  username = user;
  socket.emit('login', username);
  setupInput();
  gameLoop();
}

// Evento: conferma login dal server con id socket assegnato
socket.on('loginSuccess', (id) => {
  localSocketId = id;
  // La UI viene gestita da login.js
  socket.emit('requestMap');
});

// Evento: errore login
socket.on('loginError', (msg) => {
  alert(`Login fallito: ${msg}`);
});

// Evento: ricezione dati mappa dal server
socket.on('mapData', (map) => {
  currentMap = map.tiles;
  drawMap();
});

// Evento: aggiornamento stato giocatori
socket.on('state', (serverPlayers) => {
  players = serverPlayers;
});

// Imposta listener per input tastiera per movimento
function setupInput() {
  window.addEventListener('keydown', (e) => {
    const directions = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right'
    };
    if (directions[e.key]) {
      socket.emit('move', directions[e.key]);
    }
  });
}

// Loop di gioco per disegnare mappa e giocatori in modo continuo
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawPlayers();
  requestAnimationFrame(gameLoop);
}

// Disegna la mappa sulla canvas
function drawMap() {
  if (!currentMap || currentMap.length === 0) return;

  for (let y = 0; y < currentMap.length; y++) {
    for (let x = 0; x < currentMap[y].length; x++) {
      const tile = currentMap[y][x];
      ctx.fillStyle = {
        grass: '#88cc88',
        water: '#3399ff',
        stone: '#999999',
      }[tile] || '#222'; // colore di default

      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

// Disegna tutti i giocatori presenti nella partita
function drawPlayers() {
  for (const id in players) {
    const player = players[id];
    drawCharacter(player.x, player.y, player.username, id === localSocketId);
  }
}

// Disegna un singolo personaggio nella posizione data
function drawCharacter(x, y, name, isLocal) {
  ctx.fillStyle = isLocal ? '#ffd700' : '#0000ff'; // colore diverso per giocatore locale
  ctx.fillRect(x * CELL_SIZE + 8, y * CELL_SIZE + 8, CELL_SIZE - 16, CELL_SIZE - 16);
  ctx.fillStyle = '#000';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(name, x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE - 2);
}
