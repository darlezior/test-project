import express from 'express';
import MapModel from './models.js';

const router = express.Router();

// CREA nuova mappa
router.post('/', async (req, res) => {
  try {
    const { name, width, height } = req.body;
    if (!name || !width || !height) {
      return res.status(400).json({ error: 'name, width e height sono obbligatori' });
    }
    // Controllo unicità nome
    const existing = await MapModel.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: 'Mappa con questo nome già esiste' });
    }
    const map = new MapModel({ name, width, height });
    await map.save();
    res.status(201).json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// OTTIENI mappa per nome
router.get('/:name', async (req, res) => {
  try {
    const map = await MapModel.findOne({ name: req.params.name });
    if (!map) return res.status(404).json({ error: 'Mappa non trovata' });
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
