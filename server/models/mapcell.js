import mongoose from 'mongoose';

const MapCellSchema = new mongoose.Schema({
  map: { type: String, required: true, default: 'defaultMap' },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  elementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Element' },
  customProperties: { type: Object, default: {} },
});

MapCellSchema.index({ map: 1, x: 1, y: 1 }, { unique: true });

export const MapCell = mongoose.model('MapCell', MapCellSchema);
