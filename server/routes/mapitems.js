import express from 'express';
import { MapItem } from '../models/MapItem.js';

const router = express.Router();

// Create MapItem
router.post('/', async (req, res) => {
  try {
    const item = new MapItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all MapItems
router.get('/', async (req, res) => {
  try {
    const items = await MapItem.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read one MapItem by id
router.get('/:id', async (req, res) => {
  try {
    const item = await MapItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update MapItem by id
router.put('/:id', async (req, res) => {
  try {
    const item = await MapItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete MapItem by id
router.delete('/:id', async (req, res) => {
  try {
    const item = await MapItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
