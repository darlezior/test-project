// ==============================================
// server.js — Avvio server MMO 2D (Node + Socket.IO + MongoDB)
// ==============================================

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ==== Modelli ====
import { Player } from './models/player.js';
import { GameMap } from './models/map.js';

// ==== Utility Inventory ====
import {
  addItemToInventory,
  removeItemFromInventory,
  getInventory,
} from './inventory.js';

// ==== Rotte modulari ====
import itemsRoutes from './mapeditor/items/itemRoutes.js';
import imageRoutes from './mapeditor/items/imageRoutes.js';
import authRoutes from './usereditor/auth.js';
import userRoutes from './usereditor/users.js';
import userEditorRoutes from './usereditor/usereditorRoutes.js';
import charRoutes from './usereditor/charRoutes.js';

// ==============================================
// Inizializzazione e configurazione base
// ==============================================

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

// Compatibilità ESM per __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==============================================
// Middleware e percorsi statici
// ==============================================

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/mapeditor', express.static(path.join(__dirname, 'mapeditor')));
app.use('/usereditor', express.static(path.join(__dirname, 'usereditor')));
app.use('/uploads', express.static(path.join(__dirname, 'mapeditor/items/images')));

// ==============================================
// API Routing — Modulari
// ==============================================

// Editor oggetti mappa
app.use('/api/items', itemsRoutes);
app.use('/api/items/images', imageRoutes);

// Account e gestione utenti
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', userEditorRoutes); // Attenzione ai conflitti
app.use('/api/chars', charRoutes);
// ==============================================
// API Routing — Mappe
// ==============================================

app.get('/api/maps', async (req, res) => {
  const maps = await GameMap.find({}, 'name');
  res.json(maps.map(m => m.name));
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
    Object.assign(existing, { width, height, layers });
    await existing.save();
    return res.json({ success: true, message: 'Mappa aggiornata' });
  }

  await GameMap.create({ name, width, height, layers });
  res.json({ success: true, message: 'Mappa creata' });
});

// ==============================================
// MongoDB — Connessione
// ==============================================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅   Connesso a MongoDB Atlas'))
  .catch(err => {
    console.error('❌   Errore connessione MongoDB:', err);
    process.exit(1);
  });

// ==============================================
// Socket.IO — Logica Multiplayer
// ==============================================

io.on('connection', (socket) => {
  console.log('✅   Client connesso:', socket.id);

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
      io.emit('playersUpdate', players.map(({ username, x, y, socketId }) => ({
        username, x, y, socketId
      })));
    } catch (err) {
      console.error('❌   Errore joinGame:', err);
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
        io.emit('playersUpdate', players.map(({ username, x, y, socketId }) => ({
          username, x, y, socketId
        })));
      }
    } catch (err) {
      console.error('❌   Errore movimento:', err);
      socket.emit('error', { message: 'Errore interno nel movimento' });
    }
  });

  socket.on('getInventory', async () => {
    try {
      const inventory = await getInventory(socket.id);
      socket.emit('inventoryData', inventory);
    } catch (err) {
      console.error('❌   Errore getInventory:', err);
      socket.emit('error', { message: 'Errore nel caricamento inventario' });
    }
  });

  socket.on('addItem', async (item) => {
    try {
      const inventory = await addItemToInventory(socket.id, item);
      socket.emit('inventoryData', inventory);
    } catch (err) {
      console.error('❌   Errore addItem:', err);
      socket.emit('error', { message: "Errore nell'aggiunta oggetto" });
    }
  });

  socket.on('removeItem', async (item) => {
    try {
      const inventory = await removeItemFromInventory(socket.id, item);
      socket.emit('inventoryData', inventory);
    } catch (err) {
      console.error('❌   Errore removeItem:', err);
      socket.emit('error', { message: 'Errore nella rimozione oggetto' });
    }
  });

  socket.on('requestMap', async () => {
    try {
      const map = await GameMap.findOne({ name: 'default' }); // Cambia se necessario
      if (map) {
        socket.emit('mapData', { tiles: map.layers });
      }
    } catch (err) {
      console.error('❌   Errore richiesta mappa:', err);
      socket.emit('error', { message: 'Errore nel caricamento mappa' });
    }
  });

  socket.on('disconnect', async () => {
    try {
      console.log('❌   Disconnesso:', socket.id);
      await Player.deleteOne({ socketId: socket.id });

      const players = await Player.find({});
      io.emit('playersUpdate', players.map(({ username, x, y, socketId }) => ({
        username, x, y, socketId
      })));
    } catch (err) {
      console.error('❌   Errore disconnessione:', err);
    }
  });
});

// ==============================================
// Avvio server
// ==============================================

server.listen(port, () => {
  console.log(`✅   Server avviato su http://localhost:${port}`);
});
