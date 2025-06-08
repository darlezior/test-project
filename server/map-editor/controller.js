// server/map-editor/controller.js
import MapItem from './model.js';

export async function listMapItems(req, res) {
  const map = req.params.map;
  const items = await MapItem.find({ map }).lean();
  res.json(items);
}

export async function addMapItem(req, res) {
  const { map, x, y, type, properties } = req.body;
  const item = new MapItem({ map, x, y, type, properties: properties || {} });
  await item.save();
  res.status(201).json(item);
}

export async function deleteMapItem(req, res) {
  await MapItem.findByIdAndDelete(req.params.id);
  res.status(204).end();
}
