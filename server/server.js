// ===============================
// server.js — Server principale
// ===============================

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { Player } from './models/player.js';
import { GameMap } from './models/map.js';
import {
  addItemToInventory,
  removeItemFromInventory,
  getInventory,
} from './inventory.js';

import itemsRoutes from './mapeditor/items/itemRoutes.js'; // Rotte oggetti mappa
import imageRoutes from './mapeditor/items/imageRoutes.js'; // Rotte immagini oggetti

// ===============================
// Variabili d'ambiente
// ===============================
dotenv.config();

// ===============================
// Setup Express + HTTP + Socket.IO
// ===============================
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

// ===============================
// Compatibilità ESM (dirname, filename)
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================
// Middleware statici e parsers
// ===============================
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/mapeditor', express.static(path.join(__dirname, 'mapeditor')));

// Rotte API REST
app.use('/api/items', itemsRoutes);

// Serve le immagini statiche (se necessario)
app.use('/uploads', express.static(path.join(__dirname, 'mapeditor/items/images')));
console.log('Serving /uploads from:', path.join(__dirname, 'mapeditor/items/images'));
// CORRETTO: API per gestione immagini sotto /api/items/images
app.use('/api/items/images', imageRoutes);

// ===============================
// Connessione a MongoDB Atlas
// ===============================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅  Connesso a MongoDB Atlas'))
  .catch((err) => {
    console.error('❌  Errore connessione MongoDB:', err);
    process.exit(1);
  });

// ===============================
// API Login (semplificata)
// ===============================
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Credenziali mancanti' });
  }
  res.json({ success: true, username });
});

// ===============================
// API Map Editor (mappe)
// ===============================
app.get('/api/maps', async (req, res) => {
  const maps = await GameMap.find({}, 'name');
  res.json(maps.map((m) => m.name));
});

app.get('/api/maps/:name', async (req, res) => {
  const map = await GameMap.findOne({ name: req.params.name });
  if (!map) return res.status(404).json({ error: 'Mappa non trovata' });
  res.json(map);
});

app.post('/api/maps', async (req, res) => {
  const { name, width, height, layers } = req.body;
  if (!name || !width || !height || !layers) {
    return res.status(400).json({ error: 'Dati incompleti' });
  }
  const existing = await GameMap.findOne({ name });
  if (existing) {
    existing.width = width;
    existing.height = height;
    existing.layers = layers;
    await existing.save();
    return res.json({ success: true, message: 'Mappa aggiornata' });
  }
  await GameMap.create({ name, width, height, layers });
  res.json({ success: true, message: 'Mappa creata' });
});

// ===============================
// Socket.IO: Multiplayer
// ===============================
io.on('connection', (socket) => {
  console.log('✅  Nuovo client connesso:', socket.id);

  socket.on('joinGame', async (username) => {
    try {
      let player = await Player.findOne({ username });
      if (!player) {
        player = await Player.create({ username, socketId: socket.id, x: 0, y: 0 });
      } else {
        player.socketId = socket.id;
        await player.save();
      }

      const players = await Player.find({});
      io.emit('playersUpdate', players.map((p) => ({
        username: p.username,
        x: p.x,
        y: p.y,
        socketId: p.socketId,
      })));
    } catch (err) {
      console.error('❌  Errore joinGame:', err);
      socket.emit('error', { message: 'Errore interno nel joinGame' });
    }
  });

  socket.on('move', async (pos) => {
    try {
      if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
        return socket.emit('error', { message: 'Posizione non valida' });
      }

      const player = await Player.findOne({ socketId: socket.id });
      if (player) {
        player.x = pos.x;
        player.y = pos.y;
        await player.save();

        const players = await Player.find({});
        io.emit('playersUpdate', players.map((p) => ({
          username: p.username,
          x: p.x,
          y: p.y,
          socketId: p.socketId,
        })));
      }
    } catch (err) {
      console.error('❌  Errore movimento:', err);
      socket.emit('error', { message: 'Errore interno nel movimento' });
    }
  });

  socket.on('getInventory', async () => {
    try {
      const inventory = await getInventory(socket.id);
      socket.emit('inventoryData', inventory);
    } catch (err) {
      console.error('❌  Errore getInventory:', err);
      socket.emit('error', { message: 'Errore nel caricamento inventario' });
    }
  });

  socket.on('addItem', async (item) => {
    try {
      const inventory = await addItemToInventory(socket.id, item);
      socket.emit('inventoryData', inventory);
    } catch (err) {
      console.error('❌  Errore addItem:', err);
      socket.emit('error', { message: "Errore nell'aggiunta oggetto" });
    }
  });

  socket.on('removeItem', async (item) => {
    try {
      const inventory = await removeItemFromInventory(socket.id, item);
      socket.emit('inventoryData', inventory);
    } catch (err) {
      console.error('❌  Errore removeItem:', err);
      socket.emit('error', { message: 'Errore nella rimozione oggetto' });
    }
  });

  socket.on('disconnect', async () => {
    try {
      console.log('❌  Client disconnesso:', socket.id);
      await Player.deleteOne({ socketId: socket.id });
      const players = await Player.find({});
      io.emit('playersUpdate', players.map((p) => ({
        username: p.username,
        x: p.x,
        y: p.y,
        socketId: p.socketId,
      })));
    } catch (err) {
      console.error('❌  Errore disconnessione:', err);
    }
  });
});

// ===============================
// Avvio server
// ===============================
server.listen(port, () => {
  console.log(`✅  Server avviato su http://localhost:${port}`);
});
