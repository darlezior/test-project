import express from 'express';
import { Equipment } from '../models/Equipment.js';

const router = express.Router();

// Create Equipment
router.post('/', async (req, res) => {
  try {
    const eq = new Equipment(req.body);
    await eq.save();
    res.status(201).json(eq);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all Equipment
router.get('/', async (req, res) => {
  try {
    const equipments = await Equipment.find();
    res.json(equipments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read one Equipment by id
router.get('/:id', async (req, res) => {
  try {
    const eq = await Equipment.findById(req.params.id);
    if (!eq) return res.status(404).json({ error: 'Not found' });
    res.json(eq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Equipment by id
router.put('/:id', async (req, res) => {
  try {
    const eq = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!eq) return res.status(404).json({ error: 'Not found' });
    res.json(eq);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Equipment by id
router.delete('/:id', async (req, res) => {
  try {
    const eq = await Equipment.findByIdAndDelete(req.params.id);
    if (!eq) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
