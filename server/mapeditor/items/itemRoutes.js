/**
 * @file itemRoutes.js
 * @description Definisce le rotte API per la gestione degli oggetti mappa (create, read, update, delete)
 */

import express from 'express';
import Item from './itemModel.js';

const router = express.Router();

// ?? GET /api/items — Ottieni tutti gli oggetti
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    console.error('Errore nel recupero oggetti:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// ?? POST /api/items — Crea un nuovo oggetto
router.post('/', async (req, res) => {
  try {
    const { name, symbol, properties } = req.body;

    if (!name || !symbol) {
      return res.status(400).json({ error: 'Nome e simbolo sono obbligatori' });
    }

    const item = new Item({
      name,
      symbol,
      properties: properties || {},
    });

    await item.save();
    res.status(201).json({ message: 'Oggetto creato', item });
  } catch (err) {
    console.error('Errore creazione oggetto:', err);
    res.status(400).json({ error: 'Dati non validi' });
  }
});

// ?? PUT /api/items/:id — Aggiorna un oggetto esistente
router.put('/:id', async (req, res) => {
  try {
    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Oggetto non trovato' });
    res.json({ message: 'Oggetto aggiornato', item: updated });
  } catch (err) {
    console.error('Errore aggiornamento oggetto:', err);
    res.status(400).json({ error: 'Dati non validi' });
  }
});

// ?? DELETE /api/items/:id — Elimina un oggetto
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Oggetto non trovato' });
    res.json({ message: 'Oggetto eliminato' });
  } catch (err) {
    console.error('Errore eliminazione oggetto:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

export default router;
