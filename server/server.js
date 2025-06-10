import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import moduli locali
import { Player } from './models/player.js';
import {
  addItemToInventory,
  removeItemFromInventory,
  getInventory,
} from './inventory.js';

// Rimuovo vecchio import mapManager (vecchio sistema mappa)
// import { getMapData } from './map/mapManager.js';

// Rotte modulari
import mapEditorRoutes from './map-editor/routes.js';
import equipmentRoutes from './routes/equipment.js';
import mapItemRoutes from './routes/mapitems.js';
import newMapRoutes from './map-editor/newmap/routes.js'; // nuove rotte creazione mappe

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

// Path compatibile con ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware statici e parsers
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.json());

// Middleware generale per loggare tutte le richieste (metodo + url)
app.use((req, res, next) => {
  console.log(`➡️  Richiesta: ${req.method} ${req.originalUrl}`);
  next();
});

// Serve la UI statica per il Map Editor (frontend)
app.use('/map-editor', express.static(path.join(__dirname, 'map-editor/public')));

// Log per ogni richiesta a /api/maps (info extra specifica)
app.use('/api/maps', (req, res, next) => {
  console.log(`➡️  Richiesta specifica a /api/maps: ${req.method} ${req.originalUrl}`);
  next();
});

// --- ROTTE API MODULARI ---
app.use('/map-editor/api', mapEditorRoutes);
app.use('/equipment', equipmentRoutes);
app.use('/mapitems', mapItemRoutes);

// Nuovo sistema mappe: rotte per creazione, modifica, cancellazione mappe
app.use('/api/maps', newMapRoutes);

// Middleware 404 per richieste non gestite e log
app.use((req, res) => {
  console.log(`❌   404 NOT FOUND: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// Connessione a MongoDB Atlas (senza opzioni deprecate)
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅        Connesso a MongoDB Atlas'))
  .catch((err) => {
    console.error('❌        Errore connessione MongoDB:', err);
    process.exit(1);
  });

// --- API BASE: login semplice (TODO: migliorare sicurezza) ---
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Credenziali mancanti' });
  }
  // TODO: Verifica credenziali reale
  res.json({ success: true, username });
});

// --- SOCKET.IO: gestione multiplayer ---
io.on('connection', (socket) => {
  console.log('✨  Nuovo client connesso:', socket.id);

  // Evento: ingresso in gioco
  socket.on('joinGame', async (username) => {
    try {
      let player = await Player.findOne({ username });
      if (!player) {
        player = await Player.create({
          username,
          socketId: socket.id,
          x: 0,
          y: 0,
        });
      } else {
        player.socketId = socket.id;
        await player.save();
      }

      // Nel vecchio metodo si usava getMapData, ora si dovrebbe gestire mappa lato client
      // oppure aggiungere qui l'invio dati mappa se serve (da implementare lato nuovo sistema)

      // Per ora emitto solo playersUpdate
      const players = await Player.find({});
      io.emit('playersUpdate', players.map((p) => ({
        username: p.username,
        x: p.x,
        y: p.y,
        socketId: p.socketId,
      })));
    } catch (err) {
      console.error('Errore joinGame:', err);
      socket.emit('error', { message: 'Errore interno nel joinGame' });
    }
  });

  // Evento: movimento del personaggio
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
      console.error('Errore movimento:', err);
      socket.emit('error', { message: 'Errore interno nel movimento' });
    }
  });

  // Evento: richiesta inventario
  socket.on('getInventory', async () => {
    try {
      const inventory = await getInventory(socket.id);
      socket.emit('inventoryData', inventory);
    } catch (err) {
      console.error('Errore getInventory:', err);
      socket.emit('error', { message: 'Errore nel caricamento inventario' });
    }
  });

  // Evento: aggiunta oggetto all'inventario
  socket.on('addItem', async (item) => {
    try {
      const inventory = await addItemToInventory(socket.id, item);
      socket.emit('inventoryData', inventory);
    } catch (err) {
      console.error('Errore addItem:', err);
      socket.emit('error', { message: "Errore nell'aggiunta oggetto" });
    }
  });

  // Evento: rimozione oggetto dall'inventario
  socket.on('removeItem', async (item) => {
    try {
      const inventory = await removeItemFromInventory(socket.id, item);
      socket.emit('inventoryData', inventory);
    } catch (err) {
      console.error('Errore removeItem:', err);
      socket.emit('error', { message: 'Errore nella rimozione oggetto' });
    }
  });

  // Evento: disconnessione client
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
      console.error('Errore disconnessione:', err);
    }
  });
});

// Avvio server
server.listen(port, () => {
  console.log(`✅ Server avviato su http://localhost:${port}`);
});
