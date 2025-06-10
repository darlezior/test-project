import express from 'express';
import MapModel from './models.js';

const router = express.Router();

console.log('✅  Routes map-editor/newmap/routes.js montate');

// Recupera tutte le mappe (solo nome, width, height)
router.get('/maps', async (_req, res) => {
  try {
    const maps = await MapModel.find({}, { name: 1, width: 1, height: 1, _id: 0 });
    res.json(maps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recupera singola mappa con matrice cells
router.get('/maps/:mapName', async (req, res) => {
  try {
    const map = await MapModel.findOne({ name: req.params.mapName });
    if (!map) return res.status(404).json({ error: 'Mappa non trovata' });
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crea nuova mappa con matrice cells vuota
router.post('/maps', async (req, res) => {
  try {
    const { name, width, height } = req.body;

    if (!name || !width || !height) {
      return res.status(400).json({ error: 'name, width e height sono obbligatori' });
    }

    // Controllo dimensioni mappe ragionevoli (esempio: 1-1000)
    if (width < 1 || width > 1000 || height < 1 || height > 1000) {
      return res.status(400).json({ error: 'Dimensioni mappe fuori range consentito (1-1000)' });
    }

    // Verifica se mappa con stesso nome esiste già
    const existing = await MapModel.findOne({ name });
    if (existing) {
      return res.status(409).json({ error: 'Nome mappa già esistente' });
    }

    // Genera matrice cells vuota con default {type: 'empty', data: {}}
    const emptyCell = { type: 'empty', data: {} };
    const cells = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => ({ ...emptyCell }))
    );

    const newMap = new MapModel({ name, width, height, cells });
    await newMap.save();

    res.status(201).json(newMap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aggiorna matrice cells e/o dimensioni mappa
router.patch('/maps/:mapName', async (req, res) => {
  try {
    const { cells, width, height } = req.body;
    const update = {};

    if (cells) update.cells = cells;
    if (width) update.width = width;
    if (height) update.height = height;

    const updatedMap = await MapModel.findOneAndUpdate(
      { name: req.params.mapName },
      update,
      { new: true }
    );

    if (!updatedMap) return res.status(404).json({ error: 'Mappa non trovata' });

    res.json(updatedMap);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Elimina mappa
router.delete('/maps/:mapName', async (req, res) => {
  try {
    const deleted = await MapModel.findOneAndDelete({ name: req.params.mapName });
    if (!deleted) return res.status(404).json({ error: 'Mappa non trovata' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
