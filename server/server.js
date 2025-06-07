import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Player } from './models/Player.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

// Path compatibilità ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.json());

// Connessione a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connesso a MongoDB Atlas');
}).catch((err) => {
  console.error('❌ Errore connessione MongoDB:', err);
});

// Route login base (può essere espansa in seguito)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    res.json({ success: true, username });
  } else {
    res.json({ success: false, message: 'Credenziali mancanti' });
  }
});

// Socket.io multiplayer
io.on('connection', (socket) => {
  console.log('?? Nuovo client connesso:', socket.id);

  socket.on('joinGame', async (username) => {
    let player = await Player.findOne({ username });

    if (!player) {
      player = await Player.create({ username, socketId: socket.id });
    } else {
      player.socketId = socket.id;
      await player.save();
    }

    const players = await Player.find({});
    io.emit('playersUpdate', players.map(p => ({
      username: p.username,
      x: p.x,
      y: p.y,
      socketId: p.socketId,
    })));
  });

  socket.on('move', async (pos) => {
    const player = await Player.findOne({ socketId: socket.id });
    if (player) {
      player.x = pos.x;
      player.y = pos.y;
      await player.save();

      const players = await Player.find({});
      io.emit('playersUpdate', players.map(p => ({
        username: p.username,
        x: p.x,
        y: p.y,
        socketId: p.socketId,
      })));
    }
  });

  socket.on('disconnect', async () => {
    console.log('❌ Client disconnesso:', socket.id);
    await Player.deleteOne({ socketId: socket.id });

    const players = await Player.find({});
    io.emit('playersUpdate', players.map(p => ({
      username: p.username,
      x: p.x,
      y: p.y,
      socketId: p.socketId,
    })));
  });
});

server.listen(port, () => {
  console.log(`?? Server avviato su http://localhost:${port}`);
});
