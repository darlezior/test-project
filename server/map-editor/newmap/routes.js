import express from 'express';
import MapModel from './models.js';
import { MapCell } from '../../models/mapCell.js';

console.log('✅  newMapRoutes montato correttamente');

const router = express.Router();

// OTTIENI tutte le mappe
router.get('/', async (_req, res) => {
  console.log('📥  Richiesta a GET /api/maps');
  try {
    const maps = await MapModel.find({});
    res.json(maps);
  } catch (err) {
    console.error('❌  Errore nel recupero mappe:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
