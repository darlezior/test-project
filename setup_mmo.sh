#!/bin/bash

set -e

echo "Pulizia vecchi file..."

rm -rf client server
mkdir -p client/js server

echo "Creazione server/server.js..."
cat > server/server.js << 'EOF'
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../client')));
app.use(express.json());

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    res.json({ success: true, username });
  } else {
    res.json({ success: false, message: 'Credenziali mancanti' });
  }
});

let players = {};

io.on('connection', (socket) => {
  console.log('Nuovo client connesso:', socket.id);

  socket.on('joinGame', (username) => {
    players[socket.id] = { username, x: 160, y: 120 };
    io.emit('playersUpdate', players);
  });

  socket.on('move', (pos) => {
    if (players[socket.id]) {
      players[socket.id].x = pos.x;
      players[socket.id].y = pos.y;
      io.emit('playersUpdate', players);
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playersUpdate', players);
    console.log('Client disconnesso:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});
EOF

echo "Creazione client/index.html..."
cat > client/index.html << 'EOF'
<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>MMO 2D Multiplayer</title>
<style>
  body { background: #222; color: white; font-family: monospace; margin: 0; }
  #login-screen, #game-screen { padding: 10px; }
  #game-screen { display: none; }
  canvas { background: #333; display: block; margin: 10px auto; border: 1px solid #555; }
</style>
</head>
<body>

<div id="login-screen">
  <h2>Login</h2>
  <input id="username" placeholder="Username" />
  <input id="password" type="password" placeholder="Password" />
  <button id="btnLogin">Entra</button>
  <p id="login-message"></p>
</div>

<div id="game-screen">
  <canvas id="gameCanvas" width="320" height="240"></canvas>
</div>

<script type="module" src="./js/login.js"></script>

</body>
</html>
EOF

echo "Creazione client/js/login.js..."
cat > client/js/login.js << 'EOF'
// /root/mmo/client/js/login.js
import { startGame } from './game.js';

const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const btnLogin = document.getElementById('btnLogin');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginMessage = document.getElementById('login-message');

btnLogin.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    loginMessage.textContent = 'Inserisci username e password';
    return;
  }

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (data.success) {
      loginScreen.style.display = 'none';
      gameScreen.style.display = 'block';
      startGame(username);
    } else {
      loginMessage.textContent = data.message || 'Errore login';
    }
  } catch {
    loginMessage.textContent = 'Errore di rete';
  }
});
EOF

echo "Creazione client/js/game.js..."
cat > client/js/game.js << 'EOF'
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
EOF

echo "Creazione client/js/input.js..."
cat > client/js/input.js << 'EOF'
// /root/mmo/client/js/input.js

let keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

export function getMovementDirection() {
  let dx = 0;
  let dy = 0;

  if (keys['arrowleft'] || keys['a']) dx = -1;
  else if (keys['arrowright'] || keys['d']) dx = 1;

  if (keys['arrowup'] || keys['w']) dy = -1;
  else if (keys['arrowdown'] || keys['s']) dy = 1;

  return { dx, dy };
}
EOF

echo "Creazione client/js/joystick.js..."
cat > client/js/joystick.js << 'EOF'
// /root/mmo/client/js/joystick.js

export function getJoystickDirection() {
  // Placeholder: nessun joystick implementato
  return { dx: 0, dy: 0 };
}
EOF

echo "Setup completato! Avvia il server con:"
echo "  node server/server.js"
echo "Poi apri http://localhost:3000 in due browser diversi per testare il multiplayer."
