// server/models/mapCell.js
import mongoose from 'mongoose';

const mapCellSchema = new mongoose.Schema({
  mapName: { type: String, required: true }, // es: 'start', 'forest-1'
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  type: { type: String, default: 'empty' }, // es: 'grass', 'wall', 'water', 'tree'
  data: { type: mongoose.Schema.Types.Mixed, default: {} } // extra: NPC, loot, passaggio
}, { timestamps: true });

mapCellSchema.index({ mapName: 1, x: 1, y: 1 }, { unique: true }); // per lookup rapido

export default mongoose.model('MapCell', mapCellSchema);
