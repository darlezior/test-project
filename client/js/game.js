// client/js/game.js

const socket = io();

let localSocketId = null;
let currentCharacter = null;  // ora conserviamo l'oggetto personaggio selezionato
let players = {};
let currentMap = [];

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const CELL_SIZE = 32;

/**
 * Inizia il gioco con l'intero oggetto personaggio selezionato
 * @param {Object} character - personaggio selezionato con tutte le info
 */
export function startGame(character) {
  currentCharacter = character;
  const username = character.name;  // nome del personaggio
  socket.emit('login', username);

  // Se serve inviare anche posizione o altro al server in futuro, lo puoi fare qui:
  // es: socket.emit('characterSelected', character);

  setupInput();
  gameLoop();

  // Mostra la schermata gioco, nasconde la selezione personaggio
  document.getElementById('char-select-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
}

// Evento conferma login
socket.on('loginSuccess', (id) => {
  localSocketId = id;

  // Invia richiesta mappa e pos iniziale basata su character.pos
  socket.emit('requestMap', currentCharacter.pos.map);

  // Potresti voler inviare la posizione iniziale per teletrasporto o simili
  // socket.emit('setPosition', currentCharacter.pos);
});

// Errore login
socket.on('loginError', (msg) => {
  alert(`Login fallito: ${msg}`);
});

// Ricezione dati mappa
socket.on('mapData', (map) => {
  currentMap = map.tiles;
  drawMap();
});

// Aggiornamento stato giocatori
socket.on('state', (serverPlayers) => {
  players = serverPlayers;
});

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

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawPlayers();
  requestAnimationFrame(gameLoop);
}

function drawMap() {
  if (!currentMap || currentMap.length === 0) return;

  for (let y = 0; y < currentMap.length; y++) {
    for (let x = 0; x < currentMap[y].length; x++) {
      const tile = currentMap[y][x];
      ctx.fillStyle = {
        grass: '#88cc88',
        water: '#3399ff',
        stone: '#999999',
      }[tile] || '#222';

      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

function drawPlayers() {
  for (const id in players) {
    const player = players[id];
    drawCharacter(player.x, player.y, player.username, id === localSocketId);
  }
}

function drawCharacter(x, y, name, isLocal) {
  ctx.fillStyle = isLocal ? '#ffd700' : '#0000ff';
  ctx.fillRect(x * CELL_SIZE + 8, y * CELL_SIZE + 8, CELL_SIZE - 16, CELL_SIZE - 16);
  ctx.fillStyle = '#000';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(name, x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE - 2);
}
