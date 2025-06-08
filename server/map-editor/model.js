import mongoose from 'mongoose';

const mapItemSchema = new mongoose.Schema({
  map: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  type: { type: String, required: true },
  properties: { type: Object, default: {} },
}, { timestamps: true });

export const MapItem = mongoose.model('MapItem', mapItemSchema);
