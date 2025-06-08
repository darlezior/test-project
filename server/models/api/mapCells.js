// server/map-editor/api/mapCells.js
import express from 'express';
import { MapCell } from '../../models/mapCell.js';

const router = express.Router();

// GET /map-editor/api/mapCells/:mapName - ritorna tutte le celle di una mappa
router.get('/:mapName', async (req, res) => {
  try {
    const mapName = req.params.mapName;
    const cells = await MapCell.find({ mapName });
    res.json(cells);
  } catch (err) {
    res.status(500).json({ error: 'Errore recupero celle mappa' });
  }
});

// PUT /map-editor/api/mapCells/:id - modifica una cella specifica
router.put('/:id', async (req, res) => {
  try {
    const cell = await MapCell.findById(req.params.id);
    if (!cell) return res.status(404).json({ error: 'Cella non trovata' });
    // Aggiorna i campi permessi (type e data)
    if (req.body.type) cell.type = req.body.type;
    if (req.body.data) cell.data = req.body.data;
    await cell.save();
    res.json(cell);
  } catch (err) {
    res.status(500).json({ error: 'Errore modifica cella' });
  }
});

export default router;
