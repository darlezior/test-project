// server/map-editor/model.js
import mongoose from 'mongoose';

const mapItemSchema = new mongoose.Schema({
  map: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  type: { type: String, required: true },
  properties: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.models.MapItem || mongoose.model('MapItem', mapItemSchema);
