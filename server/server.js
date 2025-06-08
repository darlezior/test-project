// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { Player } from './models/player.js';
import {
  addItemToInventory,
  removeItemFromInventory,
  getInventory,
} from './inventory.js';
import { getMapData } from './map/mapManager.js';

// Import rotte editor da map-editor/routes.js
import mapEditorRoutes from './map-editor/routes.js';

import equipmentRoutes from './routes/equipment.js';
import mapItemRoutes from './routes/mapitems.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

// ESM compatibilità path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware statici e JSON
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.json());

// Statici map editor UI (index.html + assets) sotto /map-editor
app.use('/map-editor', express.static(path.join(__dirname, 'map-editor/public')));

// Connessione a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connesso a MongoDB Atlas');
}).catch((err) => {
  console.error('❌ Errore connessione MongoDB:', err);
});

// Rotte base
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    res.json({ success: true, username });
  } else {
    res.json({ success: false, message: 'Credenziali mancanti' });
  }
});

// Rotte modulari
app.use('/equipment', equipmentRoutes);
app.use('/mapitems', mapItemRoutes);
app.use('/map-editor/api', mapEditorRoutes);

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
    const mapData = await getMapData('start');
    socket.emit('mapData', mapData);

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

  socket.on('getInventory', async () => {
    const inventory = await getInventory(socket.id);
    socket.emit('inventoryData', inventory);
  });

  socket.on('addItem', async (item) => {
    const inventory = await addItemToInventory(socket.id, item);
    socket.emit('inventoryData', inventory);
  });

  socket.on('removeItem', async (item) => {
    const inventory = await removeItemFromInventory(socket.id, item);
    socket.emit('inventoryData', inventory);
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

// Avvio server
server.listen(port, () => {
  console.log(`?? Server avviato su http://localhost:${port}`);
});
