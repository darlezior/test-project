// server/map-editor/api/elements.js
import express from 'express';
import { Element } from '../../models/element.js';

const router = express.Router();

// GET /map-editor/api/elements - ritorna lista di tutti gli elementi
router.get('/', async (req, res) => {
  try {
    const elements = await Element.find({});
    res.json(elements);
  } catch (err) {
    res.status(500).json({ error: 'Errore recupero elementi' });
  }
});

// POST /map-editor/api/elements - crea nuovo elemento
router.post('/', async (req, res) => {
  try {
    const { name, image, properties } = req.body;
    if (!name || !image) {
      return res.status(400).json({ error: 'Name e Image sono obbligatori' });
    }
    const element = new Element({ name, image, properties });
    await element.save();
    res.status(201).json(element);
  } catch (err) {
    res.status(500).json({ error: 'Errore creazione elemento' });
  }
});

// PUT /map-editor/api/elements/:id - modifica un elemento esistente
router.put('/:id', async (req, res) => {
  try {
    const { name, image, properties } = req.body;
    const element = await Element.findById(req.params.id);
    if (!element) return res.status(404).json({ error: 'Elemento non trovato' });
    if (name) element.name = name;
    if (image) element.image = image;
    if (properties) element.properties = properties;
    await element.save();
    res.json(element);
  } catch (err) {
    res.status(500).json({ error: 'Errore modifica elemento' });
  }
});

// DELETE /map-editor/api/elements/:id - elimina elemento
router.delete('/:id', async (req, res) => {
  try {
    await Element.findByIdAndDelete(req.params.id);
    res.json({ message: 'Elemento eliminato' });
  } catch (err) {
    res.status(500).json({ error: 'Errore eliminazione elemento' });
  }
});

export default router;
