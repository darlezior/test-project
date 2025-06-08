import { MapItem } from './model.js';

export async function getItems(req, res) {
  const map = req.params.map;
  const items = await MapItem.find({ map });
  res.json(items);
}

export async function createItem(req, res) {
  try {
    const newItem = new MapItem(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateItem(req, res) {
  try {
    const updated = await MapItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Item not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteItem(req, res) {
  try {
    const deleted = await MapItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
