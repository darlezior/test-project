import { io } from "https://cdn.socket.io/4.6.1/socket.io.esm.min.js";
import { getMovementDirection } from './input.js';
import { getJoystickDirection } from './joystick.js';
import { log } from './logger.js'; // Log visibile nel box #log

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let players = {};               // Stato giocatori ricevuto dal server (escluso locale)
let localPlayerName = '';       // Username locale
let localPosition = { x: 160, y: 120 }; // Posizione locale giocatore

const socket = io();

// Ultima posizione inviata al server
let lastSentPosition = { x: null, y: null };
let lastMoveSentTime = 0;
const MOVE_SEND_INTERVAL = 200; // Invii max 5 volte al secondo

socket.on('playersUpdate', (serverPlayers) => {
  players = {};
  for (const p of serverPlayers) {
    if (p.socketId !== socket.id) {
      players[p.socketId] = p;
    }
  }
  drawPlayers();
});

function drawPlayers() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Disegna gli altri giocatori
  for (const id in players) {
    const p = players[id];
    drawCharacter(p.x, p.y, p.username, false);
  }

  // Disegna il personaggio locale
  drawCharacter(localPosition.x, localPosition.y, localPlayerName, true);
}

function drawCharacter(x, y, username, isLocal) {
  // Corpo
  ctx.fillStyle = isLocal ? '#00ff00' : '#0099ff';
  ctx.fillRect(x - 7, y, 14, 28);

  // Testa
  ctx.beginPath();
  ctx.arc(x, y - 10, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#ffcc99';
  ctx.fill();

  // Occhi
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x - 4, y - 10, 2, 0, Math.PI * 2);
  ctx.arc(x + 4, y - 10, 2, 0, Math.PI * 2);
  ctx.fill();

  // Username
  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(username, x, y + 30);
}

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

export function startGame(username) {
  localPlayerName = username;
  socket.emit('joinGame', username);
  log(`Avvio gioco per utente: ${username}`);
  gameLoop();
}
