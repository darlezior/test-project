// /root/mmo/client/js/game.js
import { io } from "https://cdn.socket.io/4.6.1/socket.io.esm.min.js";
import { getMovementDirection } from './input.js';
import { getJoystickDirection } from './joystick.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let players = {};
let localPlayerName = '';
let localPosition = { x: 160, y: 120 };

const socket = io();

socket.on('playersUpdate', (serverPlayers) => {
  players = serverPlayers;
  drawPlayers();
});

function drawPlayers() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const id in players) {
    const p = players[id];
    ctx.fillStyle = (id === socket.id) ? '#00ff00' : '#0099ff';
    ctx.fillRect(p.x - 7, p.y, 14, 28);

    ctx.beginPath();
    ctx.arc(p.x, p.y - 10, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc99';
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(p.x - 4, p.y - 10, 2, 0, Math.PI * 2);
    ctx.arc(p.x + 4, p.y - 10, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(p.username, p.x, p.y + 30);
  }
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

    socket.emit('move', localPosition);
  }
  drawPlayers();

  requestAnimationFrame(gameLoop);
}

export function startGame(username) {
  localPlayerName = username;
  socket.emit('joinGame', username);
  gameLoop();
}
