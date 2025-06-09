import express from 'express';
import { Element } from '../models/element.js';
import { MapCell } from '../models/mapCell.js'; // attenzione: export default nel modello

const router = express.Router();

// --- ELEMENTI ---
// Recupera tutti gli elementi (tile types, oggetti, ecc)
router.get('/elements', async (req, res) => {
  try {
    const elements = await Element.find({});
    res.json(elements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aggiunge un nuovo elemento con nome, immagine e proprietà
router.post('/elements', async (req, res) => {
  try {
    const element = new Element(req.body);
    await element.save();
    res.status(201).json(element);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Modifica un elemento esistente per id
router.patch('/elements/:id', async (req, res) => {
  try {
    const element = await Element.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!element) return res.status(404).json({ error: 'Elemento non trovato' });
    res.json(element);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cancella un elemento per id
router.delete('/elements/:id', async (req, res) => {
  try {
    await Element.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- CELLE MAPPA ---
// Recupera tutte le celle per una mappa specifica
router.get('/mapcells/:mapName', async (req, res) => {
  try {
    const mapName = req.params.mapName;
    const cells = await MapCell.find({ mapName });
    res.json(cells);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aggiunge una cella mappa nuova se non esiste (mapName, x, y, type, data)
router.post('/mapcells', async (req, res) => {
  try {
    const { mapName, x, y, type = 'empty', data = {} } = req.body;
    // Controllo unicità cella su coordinate e mappa
    const existing = await MapCell.findOne({ mapName, x, y });
    if (existing) {
      return res.status(400).json({ error: 'Cella già esistente' });
    }
    const cell = new MapCell({ mapName, x, y, type, data });
    await cell.save();
    res.status(201).json(cell);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Modifica cella mappa esistente per id
router.patch('/mapcells/:id', async (req, res) => {
  try {
    const cell = await MapCell.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cell) return res.status(404).json({ error: 'Cella non trovata' });
    res.json(cell);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cancella una cella per id
router.delete('/mapcells/:id', async (req, res) => {
  try {
    await MapCell.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
