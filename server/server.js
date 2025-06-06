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
